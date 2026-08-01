+++
title = 'MySQL Group Replication'
date = 2026-08-01T11:11:11+03:00
lastmod = 2026-08-01T11:11:11+03:00
tags = ["mysql"]
+++

Group replication (GR) can operate in two modes:
	1. Single primary
	2. Multiple primaries

If a group member becomes unavailable clients need to failover to another member. GR doesn't provide a built-in method for this. We'll probably use [[MySQL Router]] for it.

GR uses [[Paxos]] in the background.

The communication protocol uses something called atomic broadcast. Every update is sent through an atomic broadcast and either all members of the group receive the transaction or none do. All members receive the same set of transactions in the same order.

First commit wins for conflicts. Conflict detection is called **certification**. 
