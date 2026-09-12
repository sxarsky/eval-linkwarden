# Pinning a link

`PATCH /api/v1/links/:id/pin` marks the link as pinned for the calling user.

The call is idempotent. A second `PATCH` on a link the caller has already pinned answers `200` and the
link stays pinned; the caller's id appears once in `pinnedBy`.

A link id that does not exist answers `404` with `{"response": "Link not found."}`.

Unpinning is not part of this endpoint.
