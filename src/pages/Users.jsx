import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Petición al backend para obtener la lista de usuarios
    axios.get('URL_DE_TU_API/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error("Error fetching users:", error));
  }, []);

  const handleBlockUser = (userId) => {
    // Lógica para bloquear al usuario
    // axios.post(...)
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Gestión de Usuarios
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="error" onClick={() => handleBlockUser(user.id)}>
                    Bloquear
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default UsersPage;