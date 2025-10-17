# Deployment Guide

This guide explains how to deploy this project to various hosting platforms.

## Project Structure
- Root `index.html` - Redirects to main project
- `ThietKeWeb/project-web-cntt1/` - Main project files
- `ThietKeWeb/vercel.json` - Vercel configuration

## Deployment Options

### 1. Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the `vercel.json` configuration
4. Deploy!

**Vercel Configuration:**
- Build Command: `echo "Static site"`
- Output Directory: `ThietKeWeb/project-web-cntt1`
- Install Command: `npm install` (if needed)

### 2. GitHub Pages
1. Enable GitHub Pages in repository settings
2. Select "GitHub Actions" as source
3. The workflow will automatically deploy on push to main branch

**Manual GitHub Pages:**
1. Go to repository Settings > Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` (created by workflow)
4. Folder: `/ (root)`

### 3. InfinityFree
1. Upload all files from `ThietKeWeb/project-web-cntt1/` to your InfinityFree public_html folder
2. The `.htaccess` file is already configured for proper routing
3. Ensure your domain points to the correct directory

### 4. Netlify
1. Connect your GitHub repository to Netlify
2. Build settings:
   - Build command: `echo "Static site"`
   - Publish directory: `ThietKeWeb/project-web-cntt1`
3. Deploy!

## Troubleshooting

### 404 Errors
- Ensure all file paths are relative (not absolute)
- Check that `index.html` exists in the root of your deployed directory
- Verify `.htaccess` file is uploaded (for Apache servers)

### CSS/JS Not Loading
- Check file paths in HTML files
- Ensure all assets are uploaded
- Verify case sensitivity of file names

### Images Not Displaying
- Check image file paths
- Ensure images are uploaded to correct directories
- Verify file permissions

## File Structure for Deployment
```
deployed-site/
├── index.html (main page)
├── Assets/
│   ├── image/
│   └── video/
├── global-style.css
├── header.css
├── main.css
├── index.js
└── .htaccess (for Apache servers)
```
