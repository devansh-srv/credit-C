# Introduction and Motivation

In India under section 135 of the Companies Act (2013), corporations must spend 2% of their average net profit from the preceding three years on Corporate Social Responsibility (CSR). 
However, many companies resort to "greenwashing" rather than making genuine societal contributions. Simultaneously, NGOs face inadequate funding, limiting their ability to execute impactful projects.
<br><br>
A decentralized Carbon Credit system leveraging blockchain can address these challenges. 
It ensures timely funding for NGOs, promotes transparency and accountability in CSR activities, and aligns corporate efforts with genuine societal and environmental betterment.

## History
Carbon trading originated in the 1990s as a market-based solution to combat climate change, starting with the Kyoto Protocol in 1997, which introduced emissions trading among countries.
It later evolved into voluntary markets and cap-and-trade systems, allowing companies to trade carbon credits globally.

# Workflow
1. NGOs will register on the platform and create Carbon Credits based on thier projects which will then be put up for sale.

2. Companies or traders can buy these can buy these credits from the NGO and resell them further if they wish to.
   - For every resell of a carbon credit, 10% of the transaction value is returned to the original creator of the credit (NGO).
   - This mechanism ensures continuous funding support for the NGO's environmental projects.

3. Credits must be available for finite amount of time to prevent double spending, once the project is completed the credits will be expired and can’t be sold further.

4. Once the NGO completes the promised project, it can expire all credits associated with that project.
   - Once the NGO completes the promised project, it can expire all credits associated with that project.
   - The web app generates a certificate verifying the credit purchase and acknowledging the person’s contribution to offsetting specific amount of carbon.

### Workflow Diagram:
![Flow diagram](https://github.com/user-attachments/assets/150eb965-a285-4da7-a434-14eb18890f79)

# Tech Stack
### Smart Contract:
*Language*: Solidity  
*Testing and Deployment*: Hardhat  

<img src="https://github.com/user-attachments/assets/e31ed5c9-0135-4911-8be5-14e06fb6d1a2" alt="Image 1" height="50">  
<img src="https://github.com/user-attachments/assets/130f7e42-eac1-4000-968b-91c1a891fab3" alt="Image 2" height="50">

### Front-end:
*Framework*: ReactJS <br>
*libraries*: EthersJS 

<img src="https://github.com/user-attachments/assets/26c3cdd9-86d2-4a62-b7e8-1574866af61c" alt="Image 1" height="50">
    <img src="https://github.com/user-attachments/assets/f39f222c-0790-4779-909e-7c8c4687620b" alt="Image 1" height="50">  


### Back-end:
*Framework*: Python-Flask <br>
*Database*: SQLite 

<img src="https://www.pngitem.com/pimgs/m/159-1595977_flask-python-logo-hd-png-download.png" alt="Image 1" height="50"> <t> <img src="https://github.com/user-attachments/assets/8957e289-ce99-4bca-8db1-457449ed5bab" alt="Image 1" height="50">

# Setup & Installation
Learn more about about hardhhat and for troubleshooting check [here](https://hardhat.org/hardhat-runner/docs/getting-started)

### Smart Contract:
1. Installing hardhat:
   Go to SmartContracts folder
   ```
   npm install --save-dev hardhat
   ```
3. Create a `.env` file and add:
   ```
   TESTNET_URL=<YOUR_ALCHEMY_OR_INFURA_URL>
   TESTNET_PRIVATE_KEY=<YOUR_METAMASK_PRIVATE_KEY>
   ```
   To get alchemy/infura url go to [Alechmy](https://dashboard.alchemy.com/apps/xpoq0n411rf3vtfr/setup) or [Infura](https://www.infura.io/)
   To get private key Metamask -> account details -> show private key (it will be preffered to use spare account for this)

4. Compile contract:
   ```
   npx hardhat compile
   ```
5. Test contract:
   ```
   npx hardhat test
   ```
6. To Run local node:
   ```
   npx hardhat node
   ```
   then
   ```
   npx hardhat ignition deploy ./ignition/modules/cc.js --network localhost
   ```
7. Setup local network in metamask:
   - Go to metamask
   - Press the network button (to the top left)
   - Add custom network
   - Write your network name
   - In RPC url add `http://127.0.0.1:8545/` (when you run hardhat node)
   - ChainID: `31337`
   - Name your network currency
   - Save network
   ![image](https://github.com/user-attachments/assets/ebe78e0b-9e32-4edc-b00e-fb84fd5ee32a)

### Back-end:
Go to backend folder
1. Create virtual env (not needed in windows):
  ```
   pip install virtualenv
    python<version> -m venv <virtual-environment-name>
  ```
2. Activate the virtual env:
   ```
   source env/bin/activate
   ```
3. Install requirements:
   ```
   pip install r.txt
   ```
4. Run Backend:
   ```
   python run.py
   ```
### Front-end:
Go to client folder
1. run:
   ```
   npm install
   ```
2. Start client:
   ```
   npm start
   ```
   it should start at `http://127.0.0.1:3000/`

### References:
- Hardhat: [https://hardhat.org/tutorial]
- Metamask: [https://support.metamask.io/getting-started/getting-started-with-metamask/]
- Python: [https://www.freecodecamp.org/news/how-to-setup-virtual-environments-in-python/]
- React: [https://legacy.reactjs.org/tutorial/tutorial.html]
