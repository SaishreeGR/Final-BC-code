import { useState } from "react";
import CryptoJS from "crypto-js";
import "./Display.css"
//yashu
//is
//a
//good
// whatever images are there it should display in list
// input is user specific which is what address data they need to see
// through button we call function by which we can get data
// when another account which don't have access call get data we get error:you don't have access so we write it in try catch block
const Display=({contract,account})=>{
    //to set data
    const [data,setData]=useState("")// initialize with useState

    const decryptFile=(encryptedContent,key)=>{
      const parsedKey=CryptoJS.enc.Utf8.parse(key);
      
      const decryptedContent=CryptoJS.AES.decrypt(encryptedContent,parsedKey,{
        mode:CryptoJS.mode.ECB,
        padding:CryptoJS.pad.Pkcs7,
      });
      const decryptedText=decryptedContent.toString(CryptoJS.enc.Utf8);
      return decryptedText;
    };

    const fetchDataAndDecrypt=async(url)=>{
      try{
        const response=await fetch(url);
        const fileContent=await response.text();
        const decryptedContent=decryptFile(fileContent,"encryption-key");
        return decryptedContent;
      }catch(error){
        console.error("Error fetching or decrypting the file:",error);
        return null;
      };
    };
    const getdata=async()=>{
      let dataArray;// as display() returns array
      const Otheraddress=document.querySelector(".address").value;//fetching the address value which user has given input
      try{
      if(Otheraddress){
        //if Otheraddress is present then 
        dataArray=await contract.display(Otheraddress)//Iam calling address related data
        console.log(dataArray);
      }else{
        dataArray=await contract.display(account);//display connected account data 
      }
    }
    catch(e){
        alert("You don't have access");// as require throws error
    }
      //if url is not there
      const isEmpty= Object.keys(dataArray).length===0;
      if(!isEmpty){
        //if it is not empty
        const str= dataArray.toString();//values are in object form so converting to string
        const str_array=str.split(","); // as string will be concatenated so we are splitting it
        // console.log(str);-->ipfs://qweehdh,ipfs://gyjnb
        //                                0              1
        // console.log(str_array);['ipfs://qweehdh','ipfs://gyjnb']
        /* we are using hyperlink to display images, in react we need to provide key -i which is iterator
        https://gateway.pinata.cloud/ipfs/${item}-->default url to access ipfs
        ${item.substring(6)} why? as in link ipfs://qweehdh we only need qweehdh becoz in default url we are inside ipfs only*/
        
        
        const images=str_array.map((item,i)=>{
          const url=`https://gateway.pinata.cloud/ipfs/${item.substring(6)}`;
          return url;
        });
        const decryptedDataArray=[];
        for(const url of images){
          const decryptedContent=await fetchDataAndDecrypt(url);
          if(decryptedContent){
            decryptedDataArray.push(decryptedContent)
          }
        }
          
          openImagesInNewTab(decryptedDataArray);
      }else{
        alert("No image to display");
      }
    };
    const openImagesInNewTab=(images)=>{
      const newTab=window.open();
      newTab.document.write(
        `
        <html>
        <head>
        <title>Files</title>
        <style>
        .center-button{
          display:flex;
          justify-content:center;
          align-items:center;
          background-color:#f04d4d;
          color:#fff;
          border:none;
          padding:10px 20px;
          border-radius:5px;
          font-size:16px;
          cursor:pointer;
          margin-top:10px;
        }
        .center-button:hover{
          background-color:#e53e3e;
        }
        .hidden-image{
          display:none;
        }
        </style>
        <body>
        ${images.map((decryptedContent,index)=> `<div><img src="${decryptedContent}" onerror="this.classList.add('hidden-image')" class="image-list"/>
        <button class="center-button" onClick="window.open('${decryptedContent}')">Open File</button>
        </div>`).join("")}
        </body>
        </html>
        `
      );
      newTab.document.close();
    };
    
    
    
    //in below we have given {data} so all the images are set into this variable so it will display the images
    return(
   
    <>
    
    <input type="text" placeholder="Enter address" className="address"></input>
    <button className="center button" onClick={getdata}>Get Data</button>

    </>
    );
    
    
  };
    
    

export default Display;

/* we need to call display() in sc for that we need access to get data , fetch url from the users account */