import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, ThemeProvider, Form } from 'react-bootstrap';
import { useEffect, useState } from "react";
import Web3 from "web3";

import TokenJson from '../../token-contract/build/contracts/Token.json' with {type: 'json'};

const abi = TokenJson.abi;
const contract_adress = '0x8cC4820b9Ab9d1c9A0250b8eb3fd135E94FdCEE5'
const tokenSymbol = "CRINGE"
const tokenDecimals = 18
const tokenImage = "https://avatars.mds.yandex.net/i?id=4936699d381909be976cf151a9058b6053cee4b7-5234092-images-thumbs&n=13"

export default function Home() {
    const [web3, setWeb3] = useState(undefined)
    const [userAddress, setUserAddress] = useState(undefined)
    const [balance, setBalance] = useState(0)
    const [contract, setContract] = useState(undefined)
    const [to, setTo] = useState('')
    const [amount, setAmount] = useState(0)
    const [toMint, setToMint] = useState('')
    const [amountMint, setAmountMint] = useState(0)
    const [owner, setOwner] = useState('');


    const handleConnect = async () => {
        const web3 = new Web3(window.ethereum);
        setWeb3(web3);
        const [address] = await window.ethereum.enable();
        setUserAddress(address.toLowerCase());

        const contract = new web3.eth.Contract(abi, contract_adress);
        setContract(contract);

        const _balance = await contract.methods.balanceOf(address).call({ from: address });
        setBalance((Number(_balance)/ (10**tokenDecimals)).toLocaleString());

        const _owner = await contract.methods.owner().call({ from: address });
        setOwner(_owner.toLowerCase());

        //await connectWallet();
    }

    const connectWallet = async () => {

        try {
            // 'wasAdded' is a boolean. Like any RPC method, an error can be thrown.
            const wasAdded = await window.ethereum // Or window.ethereum if you don't support EIP-6963.
                .request({
                    method: "wallet_watchAsset",
                    params: {
                        type: "ERC20",
                        options: {
                            // The address of the token.
                            address: contract_adress,
                            // A ticker symbol or shorthand, up to 5 characters.
                            symbol: tokenSymbol,
                            // The number of decimals in the token.
                            decimals: tokenDecimals,
                            // A string URL of the token logo.
                            image: tokenImage,
                        },
                    },
                })

            if (wasAdded) {
                alert("Кринж навален")
            } else {
                console.log("Кринжа не будет")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getBalance = async () => {
        const _balance = await contract.methods.balanceOf(userAddress).call({ from: userAddress });
        const new_balance = (Number(_balance)/ (10**tokenDecimals)).toLocaleString();
        alert(`Новый баланс: ${new_balance}\nСтарый баланс: ${balance}`);
        setBalance()
    }

    const changeTo = (evt) => {
        const val = evt.target.value;
        setTo(val)
    }

    const changeAmount = (evt) => {
        const val = evt.target.value;
        setAmount(val)
    }

    const changeToMint = (evt) => {
        const val = evt.target.value;
        setToMint(val)
    }

    const changeAmountMint = (evt) => {
        const val = evt.target.value;
        setAmountMint(val)
    }

    const sendTokens = async () => {
        try {
            await contract.methods.transfer(to, amount).send({ from: userAddress });
            await getBalance();
        }
        catch (e) {
            alert("Неудалось исполнить по причине: " + e);
        }
    }

    const mintTokens = async () => {
        try {
            await contract.methods.mint(toMint, amountMint).send({ from: userAddress });
            await getBalance();
        }
        catch (e) {
            alert("Неудалось исполнить по причине: " + e);
        }
    }


    if (userAddress) {

        return (
            <div>
                <div id='container'>
                    <div className='innerContainer'>
                        <h2>userId:</h2>
                        <h2>{userAddress}</h2>
                        <h2>balance: {balance}</h2>
                        <form id='inputForm'>
                            <Form.Control size="sm" type="text" placeholder="Каму..." onChange={changeTo} />
                            <Form.Control size="sm" type="number" onkeypress="event.charCode > 48" min="1" placeholder="Сколька..." onChange={changeAmount} />
                            <Button variant='danger' onClick={sendTokens}>Отправить деняг</Button>
                        </form>
                    </div>
                    
                    {
                        userAddress == owner &&
                        <div className='innerContainer'>
                            <form id='inputForm'>
                                <h1>Чеканка кринжеток</h1>
                                <Form.Control size="sm" type="text" placeholder="Каму..." onChange={changeToMint} />
                                <Form.Control size="sm" type="number" onkeypress="event.charCode > 48" min="1" placeholder="Сколька..." onChange={changeAmountMint} />
                                <Button variant='danger' onClick={mintTokens}>Отправить деняг</Button>
                            </form>
                        </div>
                    }
                    <Button variant='danger' onClick={connectWallet}>Добавить кринжа в кошелёк</Button>
                </div>
            </div>
        )
    }
    return (
        <div className='position-absolute top-50 start-50 translate-middle'>
            <Button variant='danger' onClick={handleConnect}>Подключение</Button>
        </div>
    )
}
