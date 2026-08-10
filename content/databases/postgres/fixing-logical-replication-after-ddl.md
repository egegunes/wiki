+++
title = 'Fixing logical replication After DDL'
date = 2026-08-10T21:00:43+03:00
lastmod = 2026-08-10T21:00:43+03:00
tags = ["replication"]
+++

```
ERROR:  logical replication target relation "public.t1" is missing replicated column: "b"
```

DDL breaks logical replication because they are not replicated and apply workers start to fail. Rather than reseeding, you can just execute the same DDL on logical replica and re-enable subscription.

```
test=# ALTER SYSTEM SET default_transaction_read_only TO off;
ALTER SYSTEM

test=# SELECT pg_reload_conf();
 pg_reload_conf
----------------
 t
(1 row)

test=# alter table t1 add column b int;
ALTER TABLE


test=# ALTER SUBSCRIPTION pgo_lr_sub_logical_test_274c8e45 ENABLE;
ALTER SUBSCRIPTION

test=# select subname, subenabled from pg_subscription;
             subname              | subenabled
----------------------------------+------------
 pgo_lr_sub_logical_test_274c8e45 | t
(1 row)

test=# select * from t1;
   id   |     a      | b
--------+------------+---
 100500 |            |
 100501 |            |
 100502 |            |
 100503 |            |
 100504 |            |
 100505 | new column |
 100506 | a          | 1
(7 rows)
```


