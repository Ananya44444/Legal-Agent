# Team Configuration Checklist

## Required Credentials and Configurations

### Google Cloud Setup
- [ ] Provide `gcloud_config.json` service account key file
  - Place it in: `config/gcloud_config.json`
  - **IMPORTANT:** Never commit this file to Git
- [ ] Project ID: _________________
- [ ] Confirm these APIs are enabled in Google Cloud Console:
  - [ ] Document AI API
  - [ ] Vertex AI API
  - [ ] Cloud Run API
  - [ ] Secret Manager API

### Firebase Setup
- [ ] Run these commands on your machine:
  ```bash
  firebase login
  firebase init
  # Select: Functions, Hosting, Emulators
  ```
- [ ] Provide Firebase configuration:
  - Create `public/js/firebase_config.js` with:
  ```javascript
  const firebaseConfig = {
    // Add configuration here
    // Get this from Firebase Console > Project Settings > Your Apps
  };
  ```
- [ ] Firebase Project ID: _________________

## Local Development Setup
After providing credentials:
1. Place `gcloud_config.json` in the `config` directory
2. Add Firebase configuration to `public/js/firebase_config.js`
3. Run local development script:
   ```bash
   cd scripts
   ./run_local.bat
   ```

## Security Notes
- Never commit credentials or config files containing secrets
- Keep `gcloud_config.json` secure
- Use environment variables when possible