import React, { useEffect, useState } from "react";

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Simulación de obtención de usuario (puedes reemplazarlo por tu lógica real)
    const obtenerUsuario = async () => {
      // Por ejemplo, desde localStorage o una API
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
      setUsuario(usuarioGuardado);
    };

    obtenerUsuario();
  }, []);

  if (!usuario) {
    return <div>Cargando usuario...</div>;
  }

  return (
    <div>
      <h1>Perfil de Usuario</h1>
      <p>Nombre: {usuario.nombre}</p>
      <p>Email: {usuario.email}</p>
      {/* Agrega más campos según tu modelo de usuario */}
    </div>
  );
};

export default Perfil;
