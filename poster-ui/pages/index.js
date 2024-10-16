import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, ThemeProvider, Form } from 'react-bootstrap';
import { useEffect, useState } from "react";
import Web3 from "web3";

import PosterJson from '../../poster-contract/build/contracts/Poster.json' with {type: 'json'};

const abi = [...PosterJson.abi];

export default function Home() {
    const [web3, setWeb3] = useState(undefined)
    const [userAddress, setUserAddress] = useState(undefined)
    const [pastMsgs, setPastMsgs] = useState([])
    const [contract, setContract] = useState(undefined)
    const [text, setText] = useState('')
    const [tag, setTag] = useState('')
    

    const handleConnect = async () => {
        const web3 = new Web3(window.ethereum)
        setWeb3(web3)
        const [address] = await window.ethereum.enable()
        setUserAddress(address)
        const contract_adress = '0x9aD2F90588EB79AF7e3F11A75EDf0b66A1b0538A'
        const contract = new web3.eth.Contract(abi, contract_adress)
        setContract(contract)

        await getMsgs(contract)

        const newPostEvent = await contract.events.NewPost({
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, event){ console.log(event); })
        
        try {
            newPostEvent
        .on('data', async function(event){
            await getMsgs(contract)
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

    const postText = async () => {
        const res = await contract.methods.post(text, tag).send( {from: userAddress})
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
