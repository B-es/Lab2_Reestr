import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from "react";
import Web3 from "web3";

import PosterJson from '../../poster-contract/build/contracts/Poster.json' with {type: 'json'};
import { jsx } from 'react/jsx-runtime';

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
            <div style={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center'}}>
                <address>userId: {userAddress}</address>
                <label htmlFor={text}>Введи текст:</label>
                <input id='text' onChange={changeText}></input>
                <label htmlFor={tag}>Введи тег:</label>
                <input tag='tag' onChange={changeTag}></input>
                <button onClick={postText}>post</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center'}}> 
                <h1>
                    Прошлые сообщения
                </h1>
                {pastMsgs.map((msg, index) => (
                    <div key={msg[0] + index}>
                    <h3>user: {msg.user}</h3>
                    <h3>text: {msg.content}</h3>
                    <h3>tag: {msg.tag}</h3>
                    </div>
                ))}
            </div>
        </div>
        )
    }
    return (
        <div>
            <button onClick={handleConnect}>Connect</button>
        </div>
    )
}
