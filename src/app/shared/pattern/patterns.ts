// ^[a-zA-Z0-9._%+-]+: Permite letras, números y algunos caracteres especiales en la parte local del correo.
// @[a-zA-Z0-9.-]+: Permite letras, números, puntos y guiones en el dominio.
// \\.[a-zA-Z]{2,}: Asegura que haya un punto seguido de al menos dos letras (por ejemplo, .com, .org, etc.).
// (\\.[a-zA-Z]{2})?$: Opcionalmente permite un segundo dominio (como .co.uk).

export const regexMail: string = "^[a-zA-Z0-9._%+-]+@(?!.*\\.\\.)[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

export const regexAlfanumericoConEspacios = '^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑüÜ]{1,50}$'; // Letras, números y espacios
export const regexDescripcion = '^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑüÜ,\\.\\-]{1,255}$'; // Descripción con comas, puntos y guiones
export const regexDireccion = '^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ.\\- ]{1,50}$'; // Dirección con letras, números, puntos y guiones
export const regexNumeros = '^[0-9]{1,10}$'; // Solo números (para cantidades)
export const regexTelefono = '^\\+?[0-9]{1,4}[0-9]{6,14}$'; // Validación de teléfonos internacionales
export const regexTextos = '^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑüÜ,\\.\\-]{1,50}$'; // Letras, espacios, puntos y guiones


// pattern contraseña. Debe contener al menos una letra minúscula, una mayúscula, un número, un carácter especial, al menos 8  y maximo 64 caracteres
export const regexContraseña: string = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:"\\\'<>?,.\\/]).{8,64}$';

// pattern contraseña. Debe contener al menos una letra minúscula, una mayúscula, un número, al menos 6 caracteres
export const regexPassword: string = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$';


