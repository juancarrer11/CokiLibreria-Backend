USE coki_libreria;

START TRANSACTION;

INSERT INTO usuarios (nombre, correo, telefono, contrasena, rol)
SELECT d.nombre, d.correo, d.telefono, d.contrasena, d.rol
FROM (
  SELECT 'Admin Coki' AS nombre, 'admin@example.com' AS correo, '3510000001' AS telefono, '$2b$10$RVqUunmbio0m9543haiPVOFQgFdSQze9bU5rEs/ns12L2InRdK972' AS contrasena, 'admin' AS rol
  UNION ALL SELECT 'Lucía Fernández', 'lucia.fernandez@example.com', '3510000002', '$2b$10$RVqUunmbio0m9543haiPVOFQgFdSQze9bU5rEs/ns12L2InRdK972', 'cliente'
  UNION ALL SELECT 'Mateo Gómez', 'mateo.gomez@example.com', '3510000003', '$2b$10$RVqUunmbio0m9543haiPVOFQgFdSQze9bU5rEs/ns12L2InRdK972', 'cliente'
  UNION ALL SELECT 'Valentina Ruiz', 'valentina.ruiz@example.com', NULL, '$2b$10$RVqUunmbio0m9543haiPVOFQgFdSQze9bU5rEs/ns12L2InRdK972', 'cliente'
  UNION ALL SELECT 'Tomás Herrera', 'tomas.herrera@example.com', '3510000005', '$2b$10$RVqUunmbio0m9543haiPVOFQgFdSQze9bU5rEs/ns12L2InRdK972', 'cliente'
) AS d
WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.correo = d.correo);

INSERT INTO pedidos (numero_retiro, id_usuario, fecha, id_estado, notas)
SELECT d.numero_retiro, u.id_usuario, d.fecha, e.id_estado, d.notas
FROM (
  SELECT 'RET-0001' AS numero_retiro, 'lucia.fernandez@example.com' AS correo, '2026-11-02' AS fecha, 'Entregado' AS estado, 'Retira por la tarde' AS notas
  UNION ALL SELECT 'RET-0002', 'mateo.gomez@example.com', '2026-11-05', 'Listo para retirar', NULL
  UNION ALL SELECT 'RET-0003', 'valentina.ruiz@example.com', '2026-11-09', 'En preparación', 'Avisar cuando esté listo'
  UNION ALL SELECT 'RET-0004', 'tomas.herrera@example.com', '2026-11-12', 'Pendiente', NULL
  UNION ALL SELECT 'RET-0005', 'lucia.fernandez@example.com', '2026-11-13', 'Cancelado', 'Cancelado por el cliente'
) AS d
JOIN usuarios u ON u.correo = d.correo
JOIN estados_pedido e ON e.nombre = d.estado
WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.numero_retiro = d.numero_retiro);

INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
SELECT p.id_pedido, pr.id_producto, d.cantidad, pr.precio
FROM (
  SELECT 'RET-0001' AS numero_retiro, 'Lapicera BIC Trazo Fino' AS producto, 2 AS cantidad
  UNION ALL SELECT 'RET-0001', 'Cuaderno Tapa Dura Grande', 1
  UNION ALL SELECT 'RET-0002', 'Lápiz Negro BIC', 3
  UNION ALL SELECT 'RET-0003', 'Hojas Cuadriculadas x24 Éxito', 2
  UNION ALL SELECT 'RET-0004', 'Plasticola', 1
  UNION ALL SELECT 'RET-0005', 'Tijera Escolar', 1
) AS d
JOIN pedidos p ON p.numero_retiro = d.numero_retiro
JOIN productos pr ON pr.nombre = d.producto
WHERE NOT EXISTS (
  SELECT 1 FROM detalle_pedido dp
  WHERE dp.id_pedido = p.id_pedido AND dp.id_producto = pr.id_producto
);

INSERT INTO impresiones (id_pedido, tipo_impresion, tipo_papel, cantidad_copias, precio_unitario, archivo, descripcion)
SELECT p.id_pedido, d.tipo_impresion, d.tipo_papel, d.cantidad_copias,
  CASE d.tipo_impresion WHEN 'Color' THEN 400 ELSE 200 END,
  d.archivo, d.descripcion
FROM (
  SELECT 'RET-0001' AS numero_retiro, 'Blanco y negro' AS tipo_impresion, 'Papel común' AS tipo_papel, 20 AS cantidad_copias, 'apunte_matematica.pdf' AS archivo, 'Doble faz' AS descripcion
  UNION ALL SELECT 'RET-0002', 'Color', 'Papel común', 5, 'afiche_escolar.pdf', NULL
  UNION ALL SELECT 'RET-0003', 'Color', 'Papel fotográfico', 3, 'foto_familiar.jpg', 'Tamaño 10x15'
  UNION ALL SELECT 'RET-0004', 'Color', 'Papel adhesivo', 10, 'etiquetas_cuadernos.png', 'Etiquetas escolares'
  UNION ALL SELECT 'RET-0005', 'Blanco y negro', 'Papel común', 15, 'resumen_historia.pdf', NULL
) AS d
JOIN pedidos p ON p.numero_retiro = d.numero_retiro
WHERE NOT EXISTS (
  SELECT 1 FROM impresiones i
  WHERE i.id_pedido = p.id_pedido AND i.archivo = d.archivo
);

INSERT INTO carrito (id_usuario, id_producto, cantidad)
SELECT u.id_usuario, pr.id_producto, d.cantidad
FROM (
  SELECT 'lucia.fernandez@example.com' AS correo, 'Felpón Doble Punta' AS producto, 2 AS cantidad
  UNION ALL SELECT 'lucia.fernandez@example.com', 'Papel Glasé', 5
  UNION ALL SELECT 'mateo.gomez@example.com', 'Cuaderno Chico Espiral', 1
  UNION ALL SELECT 'valentina.ruiz@example.com', 'Lápices de Colores Grandes', 1
  UNION ALL SELECT 'tomas.herrera@example.com', 'Cinta Adhesiva Transparente / Scotch', 2
) AS d
JOIN usuarios u ON u.correo = d.correo
JOIN productos pr ON pr.nombre = d.producto
WHERE NOT EXISTS (
  SELECT 1 FROM carrito c
  WHERE c.id_usuario = u.id_usuario AND c.id_producto = pr.id_producto
);

COMMIT;
