# Installing Supabase CLI on Windows

Since the automatic installation methods aren't working, here's how to install Supabase CLI manually:

## Method 1: Manual Download (Recommended)

1. **Download the CLI**:
   - Go to: https://github.com/supabase/cli/releases
   - Download the latest `supabase_windows_amd64.exe`
   - Rename it to `supabase.exe`

2. **Add to PATH**:
   - Create a folder: `C:\supabase`
   - Move `supabase.exe` to `C:\supabase\`
   - Add `C:\supabase` to your system PATH:
     - Open System Properties → Advanced → Environment Variables
     - Edit PATH variable
     - Add `C:\supabase`
     - Click OK

3. **Verify installation**:
   ```powershell
   supabase --version
   ```

## Method 2: Using PowerShell (Alternative)

```powershell
# Create directory
New-Item -ItemType Directory -Path "C:\supabase" -Force

# Download CLI
$url = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe"
$output = "C:\supabase\supabase.exe"
Invoke-WebRequest -Uri $url -OutFile $output

# Add to PATH (requires admin)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\supabase", "User")
```

## Method 3: Using Chocolatey (if available)

First install Chocolatey:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Then install Supabase:
```powershell
choco install supabase
```

## Method 4: Using Scoop (if available)

First install Scoop:
```powershell
Set-ExecutionPolicy RemoveRestriction -Scope CurrentUser
irm get.scoop.sh | iex
```

Then install Supabase:
```powershell
scoop install supabase
```

## Testing Without CLI

If you can't install the CLI, you can still test the frontend:

1. **Start your React app**:
   ```bash
   npm run dev
   ```

2. **Test the UI**:
   - Go to `http://localhost:3000/profile`
   - Click "Edit Profile"
   - Test form validation
   - Test avatar preview (frontend only)

3. **Deploy manually via Supabase Dashboard**:
   - Go to your Supabase project
   - Navigate to Functions
   - Upload the function code manually
   - Run SQL migrations in the SQL Editor

## Troubleshooting

### Permission Issues
- Run PowerShell as Administrator
- Check Windows Defender/Firewall settings
- Try downloading from a different network

### PATH Issues
- Restart your terminal after adding to PATH
- Check if the path is correctly added: `echo $env:PATH`

### Network Issues
- Try using a VPN
- Check corporate firewall settings
- Try downloading from a mobile hotspot 