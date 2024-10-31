import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, ThemeProvider, Form } from 'react-bootstrap';
import { useEffect, useState } from "react";
import Web3 from "web3";

import PosterJson from '../../token-gated-poster/build/contracts/Poster.json' with {type: 'json'};
import TokenJson from '../../token-gated-poster/build/contracts/Token.json' with {type: 'json'};

const posterAbi = PosterJson.abi;
const tokenAbi = TokenJson.abi;

const tokenSymbol = "CRINGE"
const tokenDecimals = 18
const tokenImage = "https://avatars.mds.yandex.net/i?id=4936699d381909be976cf151a9058b6053cee4b7-5234092-images-thumbs&n=13"

const poster_contract_address = '0x2E06D10F73F73bC29311b45CE114841c6971e700'
const token_contract_address = '0x8cC4820b9Ab9d1c9A0250b8eb3fd135E94FdCEE5'

export default function Home() {
    const [web3, setWeb3] = useState(undefined)
    const [userAddress, setUserAddress] = useState(undefined)
    const [pastMsgs, setPastMsgs] = useState([])
    const [posterContract, setPosterContract] = useState(undefined)
    const [tokenContract, setTokenContract] = useState(undefined)
    const [text, setText] = useState('')
    const [tag, setTag] = useState('')
    const [to, setTo] = useState('')
    const [amount, setAmount] = useState(0)
    const [toMint, setToMint] = useState('')
    const [amountMint, setAmountMint] = useState(0)
    const [owner, setOwner] = useState('');
    const [balance, setBalance] = useState(0)
    

    const handleConnect = async () => {
        const web3 = new Web3(window.ethereum)
        setWeb3(web3)

        const [address] = await window.ethereum.enable()
        setUserAddress(address)
        
        const posterContract = new web3.eth.Contract(posterAbi, poster_contract_address)
        setPosterContract(posterContract)

        await posterContract.methods.setTokenAddress(token_contract_address).send({from:address});
        await posterContract.methods.setThreshold(10 * (10**decimals)).send({from:address});

        const tokenContract = new web3.eth.Contract(tokenAbi, token_contract_address)
        setTokenContract(tokenContract)


        const _balance = await tokenContract.methods.balanceOf(address).call({ from: address });
        setBalance((Number(_balance)/ (10**tokenDecimals)).toLocaleString());

        const _owner = await tokenContract.methods.owner().call({ from: address });
        setOwner(_owner.toLowerCase());

        await getMsgs(posterContract)

        const newPostEvent = await posterContract.events.NewPost({
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, event){ console.log(event); })
        
        try {
            newPostEvent
        .on('data', async function(event){
            await getMsgs(posterContract)
            console.log(event);
        })
        .on('changed', function(event) {
            console.log("Работает")
        })
        .on('error', console.error);
        }
        catch {
            console.log('Ошибка на on')
        }
        
        
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
                            address: token_contract_address,
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


    const postText = async () => {
        try{
            const res = await posterContract.methods.post(text, tag).send( {from: userAddress})
        }
        catch(e){
            const threshold = posterContract.methods.threshold().call({from:userAddress});
            alert("Ошибка, вам не хватает токенов, нужно " + threshold);
        }
    }

    const getMsgs = async (contract) => {
        const events = await contract.getPastEvents('NewPost', {
            fromBlock: 0,
            toBlock: 'latest'
          });
          
          let items = [];
        for(let event of events){
            items.push(event.returnValues);
        }
        setPastMsgs(items);
    }

    const changeText = (evt) => {
        const val = evt.target.value;
        setText(val)
    }

    const changeTag = (evt) => {
        const val = evt.target.value;
        setTag(val)
    }

    const getBalance = async () => {
        const _balance = await tokenContract.methods.balanceOf(userAddress).call({ from: userAddress });
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
            await tokenContract.methods.transfer(to, amount).send({ from: userAddress });
            await getBalance();
        }
        catch (e) {
            alert("Неудалось исполнить по причине: " + e);
        }
    }

    const mintTokens = async () => {
        try {
            await tokenContract.methods.mint(toMint, amountMint).send({ from: userAddress });
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
                        <form id='inputForm'>
                            <address>userId: {userAddress}</address>
                            <Form.Control size="sm" type="text" placeholder="Введи текст" onChange={changeText}/>
                            <Form.Control size="sm" type="text" placeholder="Введи тег" onChange={changeTag}/>
                            <Button variant='danger' onClick={postText}>Отправить пост</Button>
                        </form>
                    </div>
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
                    
                    <div className='innerContainer'> 
                        <h1>
                            Прошлые сообщения
                        </h1>
                        <div id='msgs'>
                            {pastMsgs.map((msg, index) => (
                                <div className='pastMsg' key={msg[0] + index}>
                                    <h5>user: {msg.user}</h5>
                                    <h5>text: {msg.content}</h5>
                                    <h5>tag: {msg.tag}</h5>
                                </div>
                            ))}
                        </div>
                    </div>
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
