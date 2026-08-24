import Header from "./Header"
import MobileBottomSheet from "./MobileBottomSheet";

interface Props {
    children: React.ReactNode 
}

const WithoutFooterLayout = ({children} : Props) =>{
    return(
        <div className="page-wraper">
            <Header design=""/>
            {children}
            <MobileBottomSheet />
        </div>
    )
}
export default WithoutFooterLayout;