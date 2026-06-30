#!/usr/bin/env python
"""Validate that commit message subjects stay short."""

import sys

message_path = sys.argv[1]
with open(message_path, encoding="utf-8") as file:
    first_line = file.readline().strip()

if len(first_line.split()) > 10:
    print("Commit message must be at most 10 words.")
    sys.exit(1)
