/* pages/create-item.js */
import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import SelectButton from './components/selectButton'
import SelectButtonGroup from './components/selectButtonGroup'
import SelectCollectionGroup from './components/selectCollectionGroup'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)

  const [mint, updateMint] = useState(false)

  
  // const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const [formInput, updateFormInput] = useState({ saleType: 'fixed', price: '', royaltyToYou: '0', royaltyToSIO: '0', SIO: '0x0000000000000000000000000000000000000000' })
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      console.log(url)
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function createMarket() {
    const { saleType, price, royaltyToYou, royaltyToSIO, SIO } = formInput
    if (!saleType || !price || !fileUrl) 
    {
      alert("please input price")
      return
    }
    
    /* first, upload to IPFS */
    const data = JSON.stringify({
      saleType, royaltyToYou, royaltyToSIO, SIO, image: fileUrl
    })

    console.log(data)
    try {
      updateMint(true)
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      console.log(url)
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
      updateMint(false)
    }  
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    console.log(tx.events[0])
    let event = tx.events[0]
    let value = event.args[2]
    
    // get token id
    let tokenId = value.toNumber()
    
    // get price
    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    // let listingPrice = await contract.getListingPrice()
    // listingPrice = listingPrice.toString()
   
    transaction = await contract.createMarketItem(nftaddress, tokenId, price, parseInt(formInput.royaltyToYou))
    await transaction.wait()
    updateMint(true)
    router.push('/')
  }

  function updateSaleType(type) {
    updateFormInput({ ...formInput, saleType: type })
  }

  return (
    <div className="flex justify-center">
      
      <div className="w-1/2 flex flex-col pb-12">
        <div className='mt-10'>
          Sale Type
        </div>
        <SelectButtonGroup
         updateSaleType = {updateSaleType}
        />
        
        <div className='mx-5 mt-5'>
          <div>
            Price
          </div>

          <div className='flex'>
            <input className="w-2/3 h-10 px-3 mb-2 text-base text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline mx-px" 
              type="text" 
              placeholder="0"
              onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
            />
            <div className="relative inline-block w-1/3 text-gray-700">
              <select className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline mx-px" placeholder="0">
                <option>BNB</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
          </div>
          
          <div>
            service fee 1%
          </div>
        </div>
        <div className='mt-5'>
          Choose collection
        </div>
        <SelectCollectionGroup
        
        />

        <div className='mx-2 mt-5'>
          <div
          onClick = {
            () => {
              console.log(formInput)
            }
          }>
            Take Action
          </div>
          <div className='mx-5'>
            <div className='mt-3'>
              Royalties to you
            </div>
            <div>
              <input 
                className="w-full h-10 px-3 mb-2 text-base text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline mx-px" 
                type="text" 
                placeholder="0"
                value = {formInput.royaltyToYou}
                onChange={e => updateFormInput({ ...formInput, royaltyToYou: e.target.value })}
              />
              <div className='flex justify-start	'>
                <div className="flex items-center mx-5">
                  <input name="royalty_to_you" type="radio" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" value="5"
                    onChange={e => {
                      updateFormInput({ ...formInput, royaltyToYou: e.target.value })
                    }}  
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    5%
                  </label>
                </div>
                <div className="flex items-center mx-5">
                  <input name="royalty_to_you" type="radio" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" value="10"
                    onChange={e => {
                      updateFormInput({ ...formInput, royaltyToYou: e.target.value })
                    }}  
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    10%
                  </label>
                </div>
                <div className="flex items-center mx-5">
                  <input name="royalty_to_you" type="radio" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" value="15"
                    onChange={e => {
                      updateFormInput({ ...formInput, royaltyToYou: e.target.value })
                    }} 
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    15%
                  </label>
                </div>
              </div>
            </div>

            <div className='mt-3'>
              Royalties to a good cause
            </div>
            <div>
              <input className="w-full h-10 px-3 mb-2 text-base text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline mx-px" type="text" placeholder="0"
                value = {formInput.royaltyToSIO}
                onChange={e => updateFormInput({ ...formInput, royaltyToSIO: e.target.value })}
              />
              <div className='flex justify-start	'>
                <div className="flex items-center mx-5">
                  <input name="royalty_to_sio" type="radio" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" value="5"
                    onChange={e => {
                      updateFormInput({ ...formInput, royaltyToSIO: e.target.value })
                    }} 
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    5%
                  </label>
                </div>
                <div className="flex items-center mx-5">
                  <input name="royalty_to_sio" type="radio" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" value="10"
                    onChange={e => {
                      updateFormInput({ ...formInput, royaltyToSIO: e.target.value })
                    }} 
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    10%
                  </label>
                </div>
                <div className="flex items-center mx-5">
                  <input name="royalty_to_sio" type="radio" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" value="15"
                    onChange={e => {
                      updateFormInput({ ...formInput, royaltyToSIO: e.target.value })
                    }} 
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    15%
                  </label>
                </div>
              </div>
            </div>
            <div className="relative inline-block w-full text-gray-700 mt-5">
              <select className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline mx-px" placeholder="0"
                onChange={e => {
                  updateFormInput({ ...formInput, SIO: e.target.value })
                }}
              >
                <option value="0x0000000000000000000000000000000000000000">Select SIO </option>
                <option value="0x41ca93D9CF66CFC09A430Ca375c689C437ACD768">SIO1</option>
                <option value="0x6d166Fc6D56753256C1A0a68A24965dDFa11f549">SIO2</option>
                <option value="0xb21091BDD4168788014CaB10542ff02aAaE2Cb09">SIO3-Pouriya</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
          </div>
        </div>
          
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }

        {

        !mint && fileUrl && (
          <button onClick={createMarket} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
            Create Digital Asset
          </button>
        )
        }

        {

          !mint && !fileUrl && (
            <span className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg text-center">
              Please upload NFT artwork first
            </span>
          )
        }
        {

          mint && (
            <span className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg text-center">
              Minting ...
            </span>
          )
        }
        
      </div>
    </div>
  )
}
