-- CreateTable
CREATE TABLE `categorias` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_pedido` (
    `id_detalle` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pedido` INTEGER NOT NULL,
    `id_producto` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,

    INDEX `fk_detalle_producto`(`id_producto`),
    UNIQUE INDEX `uq_detalle_pedido_producto`(`id_pedido`, `id_producto`),
    PRIMARY KEY (`id_detalle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estados_pedido` (
    `id_estado` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id_estado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `impresiones` (
    `id_impresion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pedido` INTEGER NOT NULL,
    `tipo_impresion` ENUM('Blanco y negro', 'Color') NOT NULL,
    `tipo_papel` ENUM('Papel común', 'Papel fotográfico', 'Papel adhesivo') NOT NULL,
    `cantidad_copias` INTEGER NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `archivo` VARCHAR(150) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    INDEX `fk_impresion_pedido`(`id_pedido`),
    PRIMARY KEY (`id_impresion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedidos` (
    `id_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_retiro` VARCHAR(10) NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `id_estado` INTEGER NOT NULL DEFAULT 1,
    `notas` VARCHAR(255) NULL,

    UNIQUE INDEX `numero_retiro`(`numero_retiro`),
    INDEX `fk_pedido_estado`(`id_estado`),
    INDEX `fk_pedido_usuario`(`id_usuario`),
    PRIMARY KEY (`id_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productos` (
    `id_producto` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `id_categoria` INTEGER NOT NULL,

    INDEX `fk_producto_categoria`(`id_categoria`),
    PRIMARY KEY (`id_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `correo` VARCHAR(120) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `rol` ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
    `fecha_alta` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `correo`(`correo`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `detalle_pedido` ADD CONSTRAINT `fk_detalle_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos`(`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido` ADD CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impresiones` ADD CONSTRAINT `fk_impresion_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos`(`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidos` ADD CONSTRAINT `fk_pedido_estado` FOREIGN KEY (`id_estado`) REFERENCES `estados_pedido`(`id_estado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidos` ADD CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE;
