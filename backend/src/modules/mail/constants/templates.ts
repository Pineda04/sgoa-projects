export const TEMPLATE = (link: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cambio de contraseña</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      max-width: 500px;
      margin: auto;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .button {
      display: inline-block;
      padding: 12px 20px;
      margin-top: 20px;
      background-color: #007BFF;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hola,</h2>
    <p>Recibimos una solicitud para cambiar tu contraseña. Si tú no solicitaste esto, puedes ignorar este mensaje.</p>
    <p>Para cambiar tu contraseña, haz clic en el siguiente botón:</p>
    
    <a href="${link}" class="button">Cambiar contraseña</a>

    <p class="footer">Este enlace expirará en 1 hora por seguridad.</p>
  </div>
</body>
</html>
`;

export const TEMPLATE_TEMP_PASSWORD = (tempPassword: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Contraseña Temporal</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      max-width: 500px;
      margin: auto;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .password-box {
      background-color: #f9f9f9;
      border: 2px dashed #007BFF;
      padding: 15px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
      border-radius: 6px;
      color: #333333;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hola,</h2>
    <p>Se ha generado una contraseña temporal para tu cuenta. Por favor, utiliza esta contraseña para iniciar sesión y cámbiala lo antes posible por motivos de seguridad.</p>
    
    <div class="password-box">${tempPassword}</div>

    <p class="footer">Te recomendamos actualizar tu contraseña inmediatamente después de iniciar sesión.</p>
  </div>
</body>
</html>
`;
