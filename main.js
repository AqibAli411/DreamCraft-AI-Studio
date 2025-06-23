const container = document.body.querySelector(".container");
const prompt = document.body.querySelector(".writting");
const generate_button = document.body.querySelector(".generate-btn");
const prompt_button = document.body.querySelector('.prompt-icon');
const form = document.getElementById('form');
const themeTogglebtn = document.body.querySelector(".theme_toggle");
const gridGallery = document.body.querySelector('.grid-gallery');

const API_KEY = 'vk-iZyDJrwYnQhB21uZ3jrt0aBXHhja9sFbvRPEifP8HN9aF';

(()=>{
    const systemPreferDark = window.matchMedia("(prefer-color-scheme: dark)").matches;
    const theme = localStorage.getItem("theme");
    const isDarkTheme = (theme === "dark") || (!theme && systemPreferDark);
    document.body.classList.toggle('dark-theme',isDarkTheme);
    document.body.querySelector('.theme_toggle i').classList = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon"; 
})()

//random prompts used when user clicks on the prompt button
const examplePrompts = [
  "A serene Japanese garden with cherry blossoms falling gently over a stone bridge",
  "A robotic owl perched on a glowing tree branch in a neon-lit cyber forest",
  "An abandoned castle floating above the clouds under a full moon",
  "A tiny astronaut exploring a coffee cup planet with swirling milk galaxies",
  "A medieval knight riding a dragon through a stormy sky",
  "A dreamy underwater city made of glowing coral and glass domes",
  "A desert caravan of camels walking under a violet twilight with golden dunes",
  "A vintage 1960s diner on Mars with a glowing red sky in the background",
  "A Viking warrior standing on a frozen cliff with the aurora borealis behind him",
  "A young girl holding an umbrella made of stars in a cosmic rainstorm"
];

const toggleTheme = ()=>{
    const isDarkTheme = document.body.classList.toggle('dark-theme');
    localStorage.setItem("theme",isDarkTheme ? "dark":"light");
    document.body.querySelector('.theme_toggle i').classList = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon"; 
}

themeTogglebtn.addEventListener("click",toggleTheme);



const generateRandomPrompt = ()=>{
    const randomPrompt = examplePrompts[Math.floor(Math.random()*(examplePrompts.length))];
    prompt.value = randomPrompt;
}

prompt_button.addEventListener("click",generateRandomPrompt);


const handleFormSubmit = (e)=>{
    e.preventDefault();
    const formData = new FormData(form);
    console.log(formData);
    const prompt = formData.get("prompt").trim();
    const selectedStyle = formData.get("style") || "realistic";
    const selectedImgCount = parseInt(formData.get("img-count")) || 1;
    let selectedAspectRatio = formData.get("aspect_ratio") || "1/1";
    selectedAspectRatio = selectedAspectRatio.replace(":","/");
    generateImageCards(prompt,selectedStyle,selectedAspectRatio,selectedImgCount);
}

form.addEventListener("submit",handleFormSubmit);

const generateImageCards = (prompt,selectedStyle,selectedAspectRatio,selectedImgCount)=>{
    //clear the gallery before using it
    gridGallery.innerHTML = "";
    for(let i =0; i<selectedImgCount; i++){ 
        gridGallery.innerHTML += 
        `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${selectedAspectRatio}">
                <div class="status-card">
                    <div class="loading-spin"></div>
                    <div class="error-sign">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <p class="status-text">Generating...</p>
                </div>
        </div>`
    }

    generateImages();
}

const updateImageCards = (imgUrl , imgId)=>{
    const imgCard = document.getElementById(`img-card-${imgId}`);
    if(!imgCard) return;
    //we no longer need loading screen

    imgCard.classList.remove("loading");

    imgCard.innerHTML = "";
    //replace older one with this
    imgCard.innerHTML = `<img src="${imgUrl}" class="result-image">
                <div class="image-overlay">
                    <a href="${imgUrl}" class="download-button" download="${Date.now()}.png">
                        <i class="fa-solid fa-download"></i>
                    </a>    
                </div>`;
}


const generateImages = async () =>{
    let API_URL = 'https://api.vyro.ai/v2/image/generations';

    let formData = new FormData(form);
    const imgCount = parseInt(formData.get("img-count")) || 1;
    formData.delete("img-count");

    generate_button.setAttribute("disabled","true");

    const totalImages = Array.from({length: imgCount},async (_,i)=>{
        //passing data
        try{
            const response = await fetch(
                API_URL,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${API_KEY}`
                    },
                    body:formData
                }
            );

            if(!response.ok) throw new Error((await response.json())?.error) 

            const result = await response.blob();
            console.log('inside total_images',result);
            updateImageCards(URL.createObjectURL(result),i);
        }
        catch(Error){
            console.log(Error);
        }
    });

    await Promise.allSettled(totalImages);

    generate_button.removeAttribute("disabled");
}
