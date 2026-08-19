import './App.css'
import { RouterProvider } from 'react-router'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import routes from './routes'

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <RouterProvider router={routes} />
    </LocalizationProvider>
  )
}

export default App
