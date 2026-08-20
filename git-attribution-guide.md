# Git Attribution Configuration Guide

To ensure all future commits in this repository are correctly attributed to your verified GitHub account (`shoaibugti-spec`) rather than the sandbox agent, you can configure your local Git identity with the following commands.

## 1. Configure Local Git Identity
Run these commands in your project terminal:

```bash
git config user.name "shoaibugti-spec"
git config user.email "your-verified-github-email@example.com"
```

*(Replace `your-verified-github-email@example.com` with the primary email address tied to your GitHub account.)*

## 2. Verify Your Configuration
Run this command to confirm your local repository is set correctly:

```bash
git config --local --list | grep user
```

## 3. What About Past Commits?
Past commits created during automated agent sessions are recorded under the agent's signature. Changing future commits will not automatically rewrite past commit history unless you explicitly perform an interactive rebase / filter-branch and force-push. If you wish to rewrite past history, let us know and we can provide the precise commands to update historical author metadata safely.
