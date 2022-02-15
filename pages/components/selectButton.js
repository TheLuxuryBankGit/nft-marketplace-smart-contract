
export default function SelectButton(props) {
    const style = props.selected ?
    'w-2/5 border-2	rounded-md mx-5 text-center border-yellow-600':
    'w-2/5 border-2 hover:border-yellow-600	rounded-md mx-5 text-center';
    
    return (
        <button 
            className={style}
            onClick={props.updateSelectedButton}
        >
            <div className="flex flex-col items-center ">
                <img className="w-1/4 rounded-md m-1" src={props.img_url} alt="Fi"  />
                {props.name}
            </div>
        </button>
    )
}