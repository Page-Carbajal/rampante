# Release Workflow Contract: Rampante Distribution

## Trigger Mechanism
**Event**: Git tag push matching pattern `v*.*.*` (semantic versioning)

**Examples**:
```bash
git tag v0.2.0
git push origin v0.2.0
# → Triggers automated release workflow
```

## Workflow Execution

### Phase 1: Environment Setup
**Inputs**:
- Git tag version (e.g., "v0.2.0")
- Repository source code
- Template definitions

**Outputs**:
- Validated environment variables
- Version metadata extracted
- Build matrix configured

**Expected Duration**: 30-60 seconds

### Phase 2: Template Generation  
**Process**: Generate CLI-specific templates in parallel

**For Each CLI** (gemini, codex, cursor, claude-code):
```yaml
- name: Generate {CLI} template
  inputs:
    - Base template files
    - CLI configuration
    - Version metadata
  outputs:
    - Processed template with CLI-specific syntax
    - Validation report
    - Template metadata
```

**Quality Gates**:
- Template syntax validation
- Required field completion check
- CLI compatibility verification

### Phase 3: Package Creation
**Process**: Create distribution packages for each CLI

**Package Contents**:
```
rampante-{cli}-{version}.zip
├── rampante.{ext}           # CLI-specific config file
├── README.md                # Installation instructions
├── VERSION                  # Package version info
├── CHECKSUM.txt            # File integrity hashes
└── templates/              # Additional template files
    ├── dry-run.template
    ├── execution.template
    └── error-handling.template
```

**Package Validation**:
- File integrity checks
- Size validation (max 1MB per package)
- Template syntax verification
- Required file presence

### Phase 4: Release Publication
**Artifacts**:
- 4 CLI-specific zip packages
- SHA256 checksums for each package  
- Release manifest (JSON)
- Release notes (auto-generated)

**GitHub Release Structure**:
```
Release: v0.2.0
Assets:
  - rampante-gemini-0.2.0.zip (145KB)
  - rampante-codex-0.2.0.zip (142KB)  
  - rampante-cursor-0.2.0.zip (148KB)
  - rampante-claude-code-0.2.0.zip (151KB)
  - release-manifest.json (2KB)
  - CHECKSUMS.txt (1KB)
```

## Release Manifest Format
```json
{
  "version": "0.2.0",
  "releaseDate": "2025-09-07T14:30:00Z",
  "packages": [
    {
      "cli": "gemini",
      "version": "0.2.0", 
      "downloadUrl": "https://github.com/page-carbajal/rampante/releases/download/v0.2.0/rampante-gemini-0.2.0.zip",
      "checksum": "sha256:abc123...",
      "size": 148654,
      "compatibilityVersion": ">=0.1.0"
    }
  ],
  "minimumSpecKitVersion": "1.0.0",
  "changelog": "https://github.com/page-carbajal/rampante/releases/tag/v0.2.0"
}
```

## Error Handling

### Template Generation Failures
```yaml
- name: Handle template failure
  condition: template_validation_failed
  actions:
    - Log specific CLI and error details
    - Continue with other CLIs
    - Mark release as partial if any CLI fails
    - Generate failure report
```

### Package Creation Failures
```yaml  
- name: Handle package failure
  condition: package_creation_failed
  actions:
    - Retry up to 3 times
    - Log detailed error context
    - Abort release if critical CLI fails
    - Notify maintainers via GitHub issue
```

### Partial Release Handling
**When Some Packages Fail**:
```
Release Status: Partial Success

✅ gemini: Package created successfully
✅ codex: Package created successfully  
❌ cursor: Template validation failed
❌ claude-code: Package creation failed

Actions Taken:
- Released available packages
- Created issue #123 for failed packages
- Updated manifest to reflect available packages only
```

## Quality Assurance

### Automated Tests
```yaml
test-matrix:
  - template-validation: Verify all templates pass syntax checks
  - package-integrity: Confirm packages extract without errors
  - installation-simulation: Test package installation in clean environment
  - cli-compatibility: Validate generated configs work with target CLIs
```

### Success Criteria
- [ ] All 4 CLI packages generated successfully
- [ ] All packages pass integrity validation
- [ ] Release manifest generated correctly
- [ ] GitHub release published with all assets
- [ ] Installation URLs return HTTP 200
- [ ] Checksums match uploaded files

## Performance Requirements
- **Total workflow duration**: < 5 minutes
- **Individual package generation**: < 30 seconds
- **Package size**: < 1MB per CLI
- **Download availability**: < 60 seconds after release
- **CDN propagation**: < 10 minutes globally

## Rollback Procedure
**If Critical Issues Discovered**:
1. Delete GitHub release and tags
2. Revert problematic changes
3. Create patch version with fixes
4. Re-run release workflow
5. Notify users of version recall

**Commands**:
```bash
# Emergency rollback
gh release delete v0.2.0 --yes
git tag -d v0.2.0
git push origin :refs/tags/v0.2.0

# Patch release
git tag v0.2.1
git push origin v0.2.1
```

## Monitoring and Notifications

### Success Notifications
- GitHub release published notification
- Slack/Discord webhook (if configured)
- Update repository README with latest version

### Failure Notifications
- GitHub issue created automatically
- Email notification to maintainers
- Failure details logged to workflow summary

### Metrics Tracked
- Release frequency
- Package download counts
- Installation success rates
- CLI-specific adoption metrics