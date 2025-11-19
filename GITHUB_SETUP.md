# GitHub Setup Guide for Claude Code Integration

## Quick Start: Push to GitHub from Replit

Follow these steps to push your A-Team Trades Pipeline project to GitHub so you can work with it in Claude Code.

---

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Repository name**: `a-team-trades-pipeline` (or your preferred name)
   - **Description**: "AI-powered diagnostic tool for UK trades businesses - Lead generation platform with GoHighLevel CRM integration"
   - **Visibility**: Choose **Private** (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click **Create repository**
4. Copy the repository URL (HTTPS): `https://github.com/YOUR_USERNAME/REPO_NAME.git`

---

## Step 2: Configure Git in Replit

### Option A: Using Replit's Git Tool (Recommended)

1. In your Replit workspace, open the **Tools** panel
2. Click the **+** button to add a new tool
3. Select **Git** from the list
4. The Git tool will be added to your workspace

### Option B: Using Replit Shell

If you prefer using the shell, continue to Step 3.

---

## Step 3: Push Code to GitHub

### Method 1: Using GitHub Personal Access Token (Recommended)

1. **Generate GitHub Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click **Generate new token** → **Generate new token (classic)**
   - Give it a name: "Replit Access"
   - Select scopes: Check **repo** (full control of private repositories)
   - Click **Generate token**
   - **COPY THE TOKEN** (you won't see it again!)

2. **Open Replit Shell** and run these commands:

```bash
# Set your GitHub username and email
git config --global user.name "YOUR_GITHUB_USERNAME"
git config --global user.email "your.email@example.com"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Verify the remote was added
git remote -v

# Check current status
git status

# Add all files to staging (if not already committed)
git add .

# Commit your changes
git commit -m "Initial commit: A-Team Trades Pipeline diagnostic application"

# Push to GitHub using Personal Access Token
# Replace YOUR_TOKEN and YOUR_USERNAME/REPO_NAME with your actual values
git push https://YOUR_TOKEN@github.com/YOUR_USERNAME/REPO_NAME.git main
```

**Example**:
```bash
git push https://ghp_xxxxxxxxxxxxxxxxxxxx@github.com/johndoe/a-team-trades-pipeline.git main
```

### Method 2: Using Replit Secrets for Token Storage

For better security, store your token in Replit Secrets:

1. In Replit, open **Tools** → **Secrets**
2. Add a new secret:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: Your GitHub Personal Access Token
3. In Replit Shell:

```bash
# Push using the secret (Replit automatically injects it)
git push https://$GITHUB_TOKEN@github.com/YOUR_USERNAME/REPO_NAME.git main
```

---

## Step 4: Verify on GitHub

1. Go to your GitHub repository URL
2. You should see all your project files
3. Verify the following files are present:
   - ✅ README.md
   - ✅ context.md
   - ✅ requirement.md
   - ✅ project-scope.md
   - ✅ package.json
   - ✅ .gitignore
   - ✅ All source code (client/, server/, shared/)

---

## Step 5: Clone in Claude Code

Now you can work with your project in Claude Code:

### Option A: Using VS Code with Claude Extension

1. Open VS Code
2. Install the **Claude** extension (if not already installed)
3. Open terminal in VS Code
4. Clone your repository:

```bash
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME
```

5. Open the project folder in VS Code
6. Start using Claude Code to work on your project!

### Option B: Using Cursor (Claude-powered IDE)

1. Open Cursor
2. File → Open → Clone Repository
3. Enter your GitHub repository URL
4. Cursor will clone and open the project
5. Use Claude features directly in Cursor

---

## Important: Environment Variables

**⚠️ CRITICAL**: Your `.env` file is NOT pushed to GitHub (it's in .gitignore for security).

When setting up in Claude Code, you'll need to recreate your environment variables:

1. Create a new `.env` file in the project root:

```bash
# In your local project directory
touch .env
```

2. Add all required environment variables (get these from Replit Secrets):

```env
# GoHighLevel CRM Integration
GHL_API_KEY=your_ghl_api_key_here
GHL_DEVELOP_LOCATION_ID=your_location_id
GHL_DEVELOP_PIT_ID=your_private_integration_token

# OpenAI Integration (GPT-5)
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_api_key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# Google Cloud Storage (Optional)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your_bucket_id
PUBLIC_OBJECT_SEARCH_PATHS=public
PRIVATE_OBJECT_DIR=.private

# Session Security
SESSION_SECRET=your_random_session_secret_here

# Database (Optional - uses in-memory storage by default)
DATABASE_URL=postgresql://username:password@host:5432/database
```

3. Never commit this file to Git (already protected by .gitignore)

---

## Working Workflow: Replit ↔ GitHub ↔ Claude Code

### Scenario 1: Make Changes in Claude Code, Push to GitHub

```bash
# In your local project (Claude Code)
git add .
git commit -m "Your commit message"
git push origin main
```

### Scenario 2: Pull Changes from GitHub to Replit

In Replit Shell:
```bash
git pull origin main
```

### Scenario 3: Pull Changes from GitHub to Local (Claude Code)

```bash
# In your local project
git pull origin main
```

---

## Troubleshooting

### Issue: "Permission denied" when pushing

**Solution**: Check your Personal Access Token has correct permissions (repo scope)

### Issue: "Remote already exists"

**Solution**: 
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### Issue: "Updates were rejected because the remote contains work"

**Solution**:
```bash
git pull origin main --rebase
git push origin main
```

### Issue: Can't see files on GitHub

**Solution**: Check .gitignore isn't excluding too much:
```bash
git status
# Look for "Untracked files" that should be committed
```

---

## Best Practices

1. **Commit Often**: Make small, focused commits with clear messages
2. **Pull Before Push**: Always pull latest changes before pushing
3. **Use Branches**: Create feature branches for major changes
4. **Protect Secrets**: Never commit .env or API keys
5. **Document Changes**: Update README.md when adding features

---

## Next Steps

Once your code is on GitHub and cloned locally:

1. ✅ Install dependencies: `npm install`
2. ✅ Configure environment variables (`.env` file)
3. ✅ Run development server: `npm run dev`
4. ✅ Use Claude Code to make improvements
5. ✅ Commit and push changes regularly
6. ✅ Test in Replit before deploying to production

---

## Additional Resources

- [GitHub Authentication Documentation](https://docs.github.com/en/authentication)
- [Git Basics Guide](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [Replit Git Documentation](https://docs.replit.com/category/git-on-replit)

---

**Happy Coding with Claude! 🚀**
