# VisProject2

The original dataset can be downloaded from https://github.com/ngorski9/VisProject2/releases/tag/v0.1.

## Prepare Data
1. Donwload the data for the IEEE Scivis Contest 2025.

2. Place the data in this folder, and rename it "initial_data.txt"

3. Run convert_to_csv_file.py (Pandas must be installed)

```sh
python3 convert_to_csv_file.py
```

4. Run normalize_csv_file.py

```sh
python3 normalize_csv_file.py
```

## Set up environment
5. Install `nvm` 
```sh
brew install nvm
mkdir ~/.nvm
```
```sh
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/etc/bash_completion" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion"' >> ~/.zshrc
```
```sh
source ~/.zshrc  # or source ~/.bashrc
```
6. Install `node.js`
```sh
nvm install 22
```
7. Create the project
```sh
cd visproject2
npm init -y
npm install three
```
8. Run the project
```sh
python -m http.server
```
Open http://localhost:8000/


