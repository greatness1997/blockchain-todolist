import { useState, useEffect } from 'react'
import WrongNetworkMessage from '../components/WrongNetworkMessage'
import ConnectWalletButton from '../components/ConnectWalletButton'
import TodoList from '../components/TodoList'
import { TaskContractAddress } from '../config' 
import TaskAbi from '../../backend/build/contracts/taskContract.json'
import { ethers } from "ethers"

/* 
const tasks = [
  { id: 0, taskText: 'clean', isDeleted: false }, 
  { id: 1, taskText: 'food', isDeleted: false }, 
  { id: 2, taskText: 'water', isDeleted: true }
]
*/

export default function Home() {
  const [correctNetwork, setCorrectNetwork] = useState(false)
  const [ isUserLoggedIn, setIsUserLoggedIn ] = useState(false)
  const [ currentAccount, setCurrentAccount ] = useState('')
  const [ input, setInput ] = useState('')
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    connectWallet()
    getAllTasks()
  }, [])

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {

    try{
      const { ethereum } = window
      if(!ethereum){
        console.log('metamask not detected')
        return
      }

      let chainId = await ethereum.request({ method: 'eth_chainId' })
      console.log('connected to chain', chainId)

      const rinkebyChainId = '0x4'
      if(chainId !== rinkebyChainId){
        alert('You are not connected to rinkeby testnet!')
        setCorrectNetwork(false)
      }else{
        setCorrectNetwork(true)
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('Found Account', accounts[0])
      setIsUserLoggedIn(true)
      setCurrentAccount(accounts[0])

    }catch(error){
      console.log(error)
    }
  }

  // Just gets all the tasks from the contract
  const getAllTasks = async () => {
    try{
      const { ethereum } = window
        if(ethereum){
          const provider = new ethers.providers.Web3Provider(ethereum)
          const signer = provider.getSigner()
          const TaskContract = new ethers.Contract(
            TaskContractAddress,
            TaskAbi.abi,
            signer
          )

          let allTasks = await TaskContract.getAllTasks()
          setTasks(allTasks)
          console.log(allTasks)
      }else(
        console.log('ethereum object does not exist')
      )
          
    }catch(error){
      console.log(error)
    }
  }

  // Add tasks from front-end onto the blockchain
  const addTask = async e => {
      e.preventDefault()

      let task = {
        taskText: input,
        isDeleted: false
      }

      try{
        const { ethereum } = window
        if(ethereum){
          const provider = new ethers.providers.Web3Provider(ethereum)
          const signer = provider.getSigner()
          const TaskContract = new ethers.Contract(
            TaskContractAddress,
            TaskAbi.abi,
            signer
          )

          TaskContract.addTask(task.taskText, task.isDeleted)
          .then(res => {
            setTasks([...tasks, task])
            console.log('Added Task')
          }).catch(err => console.log(err))
        }else{
          console.log('ethereum object does not exist')
        }
      }catch(error){
          console.log(error)
      }
      setInput('')
  }

  // Remove tasks from front-end by filtering it out on our "back-end" / blockchain smart contract
  const deleteTask = key => async () => {
      try{

        const { ethereum } = window
        if(ethereum){
          const provider = new ethers.providers.Web3Provider(ethereum)
          const signer = provider.getSigner()
          const TaskContract = new ethers.Contract(
            TaskContractAddress,
            TaskAbi.abi,
            signer
          )

          const deleteTaskTx = await TaskContract.deleteTask(key, true)
          console.log('successfully deleted', deleteTaskTx)

          let allTasks = await TaskContract.getAllTasks()
          setTasks(allTasks)
        }

      }catch(error){
        console.log('ethereum object does not exist')
      }
  }

  return (
    <div className='bg-[#97b5fe] h-screen w-screen flex justify-center py-6'>
      {!isUserLoggedIn ? <ConnectWalletButton connectWallet={connectWallet}/> :
        correctNetwork ? <TodoList tasks={tasks} input={input} setInput={setInput} addTask={addTask} deleteTask={deleteTask} /> : <WrongNetworkMessage />}
    </div>
  )
}

