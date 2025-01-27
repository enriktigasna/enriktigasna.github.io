import type { Component } from 'svelte';

export type PostMetadata = {
	title: string;
	description: string;
	date: number;
	tags: string[];
	slug: string;
	published: boolean;
};

export type Post = {
	content: Component;
	meta: PostMetadata; // Fix
};
