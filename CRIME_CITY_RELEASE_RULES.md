# CRIME CITY — NON-NEGOTIABLE RELEASE RULES

1. Primary user-facing app is **Crime City 12.0** at `index.html` loading `game.html`. The installed iPhone Home Screen icon must open **the same primary version** via the unchanged app URL and manifest start_url `./`.
2. **Never erase or silently overwrite player data.** Preserve all localStorage records with `crimecity*` prefixes, especially `crimecitysave5` (wallet, owned, tuning, selectedGarage), `crimecityempire7` (estates), `crimecity9`, and `crimecitystory12`. Save before installing and retain rollback snapshots.
3. IMPORTANT: Safari, ChatGPT in-app browser, and iOS standalone Home Screen can use distinct localStorage databases. A server deployment or a GitHub commit cannot synchronize those stores. Explicit portable CC14 code export/import is required, and should be offered before replacing the app.
4. Never assume a fresh browser's starter wallet or one owned Coupe means prior wealth was deleted. Never patch demo purchases or a guessed amount into the user's save. Read existing state and require explicit confirmation before restoring.
5. Known verified portable save on 2026-11-04: wallet **7,345,000 RUB**, **6/6 owned**, **all 6 tuning [4,4]**, selectedGarage **4** (Aventador), estate flags **3/3 true**, story done 5, rep 5. DO NOT publish the actual user backup code or private contents in this public repository.
6. **Do not change the primary index loader to an experimental version.** All prototypes use separate URLs (`city15.html`, etc.), and get user-tested on iPhone first.
7. Before any release test: syntax, iOS viewport and tap controls, save data preserved, stable Home Screen launch, correct route, GitHub Pages deployment successful. No “working” claim based on syntax check only.
8. On empty/incomplete save, block autoplay into old game until player explicitly chooses restore or continue. No implicit restore that might overwrite newer data.
9. Never delete old HTML builds, working legacy files or manifest. Keep backups. User has repeatedly explicitly instructed these rules; release protection has highest priority.

