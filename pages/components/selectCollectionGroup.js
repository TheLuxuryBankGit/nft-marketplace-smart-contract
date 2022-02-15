// import { useState } from "react"
import SelectButton from "./selectButton"
import React, { useState } from 'react';

export default function SelectCollectionGroup() {

    const [selectedButton, setSelecetedButton] = useState(1);

    return (
        <div className='flex justify-center mt-5'>
        
          <SelectButton
            name = "Create own"
            img_url = "../assets/magic.png"
            updateSelectedButton = {()=>{
                console.log("1")
                setSelecetedButton(1)}
            }
            selected = {selectedButton == 1}
          />
          <SelectButton
            name = "Orica Single"
            img_url = "../assets/orica.png"
            updateSelectedButton = {()=>{
                console.log("2")
                setSelecetedButton(2)}
            }
            selected = {selectedButton == 2}
          />
          
        </div>
    )
}