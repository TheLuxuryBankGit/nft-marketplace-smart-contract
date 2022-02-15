// import { useState } from "react"
import SelectButton from "./selectButton"
import React, { useState } from 'react';

export default function SelectButtonGroup(props) {

    const [selectedButton, setSelecetedButton] = useState(1);

    return (
        <div className='flex justify-center mt-5'>
        
          <SelectButton
            name = "Fixed price"
            img_url = "../assets/fixed.png"
            updateSelectedButton = {()=>{
                console.log("1")
                setSelecetedButton(1)
                props.updateSaleType("fixed")
            }
            }
            selected = {selectedButton == 1}
          />
          <SelectButton
            name = "Timed auction"
            img_url = "../assets/auction.svg"
            updateSelectedButton = {()=>{
                console.log("2")
                setSelecetedButton(2)
                props.updateSaleType("auction")
            }
            }
            selected = {selectedButton == 2}
          />
          
        </div>
    )
}