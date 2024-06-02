[![OX Security Scan](https://github.com/aaronhmiller/remove-exclusions/actions/workflows/ox.yml/badge.svg)](https://github.com/aaronhmiller/remove-exclusions/actions/workflows/ox.yml)
[![Deno](https://github.com/aaronhmiller/remove-exclusions/actions/workflows/deno.yml/badge.svg)](https://github.com/aaronhmiller/remove-exclusions/actions/workflows/deno.yml)

# remove-exclusions

Remove all exclusions created by the given excluder. BE CAREFUL. Use at your own
risk.

## Prerequisites

[Install deno](https://docs.deno.com/runtime/manual/getting_started/installation)

## Usage

1. in `remove.ts` replace the `excluder` parameter w/ the email of the
   `Excluded By` value from OX for which you wish to remove ALL the Exclusions
   associated with that id.
2. in the .env file (create it if you don't have one), add your
   `OX_API_KEY=<value_here>`
3. run `deno run -A remove.ts` (the `-A` allows all permissions)

## Expected output

An array of removed exclusionIds, something like this:

```
[
  {
    data: { removeAlertExclusion: { id: "665b98abd40a3e5f2de452e8" } }
  },
  {
    data: { removeAlertExclusion: { id: "665b98abd40a3e5f2de452d7" } }
  },
  <snip>
]
```

If there are no exclusions created by the given excluder, the output is simply:
`[]`
