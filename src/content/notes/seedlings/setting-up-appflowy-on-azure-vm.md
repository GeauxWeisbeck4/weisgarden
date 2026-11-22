---
title: "Setting Up Appflowy on Azure VM"
description: "A full walkthrough on how to set up an open source software virtual machine using Microsoft Azure. Includes all the little details for choosing an OS, workloads, networking, etc."
publishDate: "2026-11-01T09:23:00Z"
tags: ["microsoft-azure", "virtual-machines", "open-source", "dev-ops", "seedling", "notes", "guide"]
status: ["seedling", "draft"]
---

## How to Set Up FOSS Tool Like Appflowy on Microsoft Azure Virtual Machine

For some reason, I feel like I always get scared to deploy something like an open source tool, a full stack app I've created, or even a hackbox to play around with on one of the major cloud computing platforms. Rather than attribute my fear to what it really is and solving that problem (paying attention to deployments and manage costs effectively), I blame it on my lack of knowledge (this isn't true, they are actually pretty easy to use) so I don't have to deploy my app like a big boy would.

I've done myself a disservice in this regard and have missed out on learning, sharing, and deploying projects how they expect you to in the real world. Whether it is Azure, AWS, or Google Cloud, I have had to understand how to use each of them at one time or another in the real world when doing paid projects for clients. You could maybe give AWS a slight nod in popularity for most jobs, but I really haven't experienced one being more popular than the other in my experience as I don't limit my clients to the service I use - I try to be flexible with their preference and figure it out from there.

Now as much fun as it is to learn while trying to ship a paid project for a client who is eager for you to deploy their app, you will probably not want to do this as it can lead to some stressful situations as your client is going to wonder if they should have gone with ol' Uncle Charlie's Web Design, Brand Marketing, and Hosting Services Company because they know how to at least use Hostinger or GoDaddy, while you are the superior developer and entrepreneur to that old lazy fuck. WE DON'T LOSE TO WANNA BE FULL STACK DEVELOPERS AND ENTREPRENEURS!

> NOTE: This tutorial could work with basically any other open source app that you are trying to self-host. Just check out their documentation for hosting on Azure VM to get specifics, but this guide is the general idea behind the whole "self-hosting on Microsoft Azure VM" concept.

## Getting Prepared to Deploy Virtual Machine on Azure

If this is your first time ever deploying an app on Aure VM or are on a new computer and forgot what you need to do, you will want to follow along on the very first steps and pay close attention to what I'm talking about. While preparing your physical machine to deploy an Azure VM, I will go over some of the architectural things, why it is important to do each of these steps, and then will obviously tell you what to do.

### SECTION TODO

- [ ] Find architectural diagram of Linux and Microsoft VM + what app looks like being deployed
- [ ] How to sign up for a Microsoft Azure Trail account w/ my account referral code
- [ ] Preparing your machine by checking if you already have your own SSH key generated that will work for your VM, if not we will generate one.\
- [ ] Setting up [nginx server](https://nginx.org) and adding ports to config file for Linux and Windows
- [ ] Download Azure CLI

## Setting Up Your Subscription, Resource Group, Network Security Group, and Virtual Machine

This is important to do before you deploy your virtual machine if you want to save a lot of heartache. Doing it as you wing it along a tutorial sucks because you will have to debug everything and it will be a pain in the ass to  connect to your app, so pay close attention here.

### SECTION TODO

- [ ] Go through steps to set this up

## Rest of Post TODO

- [ ] Setting up auth with Google, GitHub, Discord, etc.
- [ ] Deploying virtual machien
- [ ] Various options for Appflowy or other apps
- [ ] Installing and using Docker Compose from CLI
- [ ] Accessing application and using
- [ ] Overview of what all is going on under the hood
- [ ] What can you customize? How would you deploy an app you built?
- [ ] Compared to AWS, Google?
