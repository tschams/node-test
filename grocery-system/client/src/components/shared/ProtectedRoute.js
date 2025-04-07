import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ role }) => {
	const { isAuthenticated, isSupplier, isStoreOwner, loading } =
		useContext(AuthContext);

	// Show loading indicator while checking authentication
	if (loading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='100vh'>
				<CircularProgress />
			</Box>
		);
	}

	// Check if user is authenticated
	if (!isAuthenticated()) {
		return <Navigate to='/login' />;
	}

	// Check role-specific access if role is specified
	if (role) {
		if (role === 'supplier' && !isSupplier()) {
			return <Navigate to='/unauthorized' />;
		}

		if (role === 'storeOwner' && !isStoreOwner()) {
			return <Navigate to='/unauthorized' />;
		}
	}

	// User is authenticated and authorized, render the child routes
	return <Outlet />;
};

export default ProtectedRoute;
