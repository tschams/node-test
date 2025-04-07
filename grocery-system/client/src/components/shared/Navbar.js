import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Box,
	IconButton,
	Menu,
	MenuItem,
	Link,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
	const { currentUser, isAuthenticated, isSupplier, isStoreOwner, logout } =
		useContext(AuthContext);
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		logout();
		navigate('/login');
		handleClose();
	};

	return (
		<AppBar position='static'>
			<Toolbar>
				<Typography
					variant='h6'
					component={RouterLink}
					to='/'
					sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
					Grocery Store Management
				</Typography>

				{isAuthenticated() ? (
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						{isSupplier() && (
							<>
								<Button
									color='inherit'
									component={RouterLink}
									to='/supplier/dashboard'>
									Dashboard
								</Button>
								<Button
									color='inherit'
									component={RouterLink}
									to='/supplier/products'>
									Products
								</Button>
								<Button
									color='inherit'
									component={RouterLink}
									to='/supplier/orders'>
									Orders
								</Button>
							</>
						)}

						{isStoreOwner() && (
							<>
								<Button
									color='inherit'
									component={RouterLink}
									to='/store/dashboard'>
									Dashboard
								</Button>
								<Button
									color='inherit'
									component={RouterLink}
									to='/store/products'>
									Products
								</Button>
								<Button
									color='inherit'
									component={RouterLink}
									to='/store/orders'>
									Orders
								</Button>
								<Button
									color='inherit'
									component={RouterLink}
									to='/store/inventory'>
									Inventory
								</Button>
							</>
						)}

						<IconButton
							size='large'
							aria-label='account of current user'
							aria-controls='menu-appbar'
							aria-haspopup='true'
							onClick={handleMenu}
							color='inherit'>
							<AccountCircleIcon />
						</IconButton>
						<Menu
							id='menu-appbar'
							anchorEl={anchorEl}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							open={Boolean(anchorEl)}
							onClose={handleClose}>
							<MenuItem onClick={handleClose}>
								<Typography>{currentUser?.email}</Typography>
							</MenuItem>
							<MenuItem
								onClick={handleClose}
								component={RouterLink}
								to='/profile'>
								Profile
							</MenuItem>
							<MenuItem onClick={handleLogout}>Logout</MenuItem>
						</Menu>
					</Box>
				) : (
					<Box>
						<Button color='inherit' component={RouterLink} to='/login'>
							Login
						</Button>
						<Button color='inherit' component={RouterLink} to='/register'>
							Register
						</Button>
					</Box>
				)}
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;
