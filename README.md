# VisProject2

The original dataset can be downloaded from https://github.com/ngorski9/VisProject2/releases/tag/v0.1.

## Set up environment
1. Install `nvm` 
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
2. Install `node.js`
```sh
nvm install 22
```
3. Create the project
```sh
cd visproject2
npm init -y
npm install three
```
4. Run the project
```sh
python -m http.server
```
Open http://localhost:8000/


