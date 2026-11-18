USE coki_libreria;

START TRANSACTION;

INSERT INTO usuarios (id_usuario, nombre, correo, telefono, contrasena, rol) VALUES
(1, 'Admin Coki', 'admin@example.com', '3510000001', 'clave_ficticia_1', 'admin'),
(2, 'Lucía Fernández', 'lucia.fernandez@example.com', '3510000002', 'clave_ficticia_2', 'cliente'),
(3, 'Mateo Gómez', 'mateo.gomez@example.com', '3510000003', 'clave_ficticia_3', 'cliente'),
(4, 'Valentina Ruiz', 'valentina.ruiz@example.com', NULL, 'clave_ficticia_4', 'cliente'),
(5, 'Tomás Herrera', 'tomas.herrera@example.com', '3510000005', 'clave_ficticia_5', 'cliente');

INSERT INTO pedidos (id_pedido, numero_retiro, id_usuario, fecha, id_estado, notas) VALUES
(1, 'RET-0001', 2, '2026-11-02', 4, 'Retira por la tarde'),
(2, 'RET-0002', 3, '2026-11-05', 3, NULL),
(3, 'RET-0003', 4, '2026-11-09', 2, 'Avisar cuando esté listo'),
(4, 'RET-0004', 5, '2026-11-12', 1, NULL),
(5, 'RET-0005', 2, '2026-11-13', 5, 'Cancelado por el cliente');

INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(1, 1, 2, 900.00),
(1, 4, 1, 7000.00),
(2, 13, 3, 400.00),
(3, 9, 2, 3500.00),
(4, 19, 1, 2000.00),
(5, 20, 1, 800.00);

INSERT INTO impresiones (id_pedido, tipo_impresion, tipo_papel, cantidad_copias, precio_unitario, archivo, descripcion) VALUES
(1, 'Blanco y negro', 'Papel común', 20, 100.00, 'apunte_matematica.pdf', 'Doble faz'),
(2, 'Color', 'Papel común', 5, 300.00, 'afiche_escolar.pdf', NULL),
(3, 'Color', 'Papel fotográfico', 3, 800.00, 'foto_familiar.jpg', 'Tamaño 10x15'),
(4, 'Color', 'Papel adhesivo', 10, 600.00, 'etiquetas_cuadernos.png', 'Etiquetas escolares'),
(5, 'Blanco y negro', 'Papel común', 15, 100.00, 'resumen_historia.pdf', NULL);

COMMIT;
