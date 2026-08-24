import Header from "./Header";
import Footer from "./Footer";
import MobileBottomSheet from "./MobileBottomSheet";

interface Props {
    children: React.ReactNode 
}


const CommanLayout = ({children} : Props) => {
    return(
        <div className="page-wraper">
            <Header design=""/>
                {children}
            <Footer />
            <MobileBottomSheet />
        </div>
    )
}
export default CommanLayout;