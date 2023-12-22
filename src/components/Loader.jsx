import { useContext } from 'react'
import sharedContext from '../context/SharedContext';
import {Backdrop,CircularProgress} from '@mui/material'
function Loader() {
    const {loader}=useContext(sharedContext);
  return (
    <>
   {loader&& <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loader}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>}
    </>
  )
}

export default Loader