+++
title = 'Monitoring logical replication'
date = 2026-08-10T18:59:51+03:00
lastmod = 2026-08-10T18:59:51+03:00
tags = ["replication"]
+++

After setting up the logical replica, any DDL on the primary is going to break the replication.

You'll see an error like:
```
2026-08-10 15:28:23.867 UTC [427] ERROR:  logical replication target relation "public.t1" is missing replicated column: "a"
```

There's no way to check this error except from the log.

`pg_stat_subscription_stats.apply_error_count` will increase every 5 seconds as the apply worker spawns and fails. Every 5 seconds seems not configurable.

There is an option to disable subscription on errors:
```sql
ALTER SUBSCRIPTION ... SET (disable_on_error = true)
```

With `disable_on_error`, `pg_subscription.subenabled` will be set to `false` if there are any errors.
