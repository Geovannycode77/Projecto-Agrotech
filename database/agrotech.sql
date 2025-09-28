-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 29, 2025 at 08:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `agrotech`
--

-- --------------------------------------------------------

--
-- Table structure for table `animais`
--

CREATE TABLE `animais` (
  `id` int(11) NOT NULL,
  `identificacao` varchar(50) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `sexo` enum('macho','fêmea') NOT NULL,
  `espécie` varchar(50) DEFAULT NULL,
  `raca` varchar(100) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `data_entrada` date DEFAULT NULL,
  `origem` varchar(100) DEFAULT NULL,
  `status` enum('ativo','vendido','morto','outro') DEFAULT 'ativo',
  `observacoes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estoque_insumos`
--

CREATE TABLE `estoque_insumos` (
  `id` int(11) NOT NULL,
  `insumo_id` int(11) NOT NULL,
  `quantidade` decimal(10,2) NOT NULL,
  `local_armazenado` varchar(100) DEFAULT NULL,
  `data_entrada` date DEFAULT NULL,
  `data_saida` date DEFAULT NULL,
  `tipo_movimentacao` enum('entrada','saida') NOT NULL,
  `destino_utilizacao` varchar(50) DEFAULT NULL,
  `observacoes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `insumos`
--

CREATE TABLE `insumos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `unidade` varchar(20) DEFAULT NULL,
  `fornecedor` varchar(100) DEFAULT NULL,
  `custo_unitario` decimal(10,2) DEFAULT NULL,
  `data_validade` date DEFAULT NULL,
  `observacoes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reproducao`
--

CREATE TABLE `reproducao` (
  `id` int(11) NOT NULL,
  `macho_id` int(11) DEFAULT NULL,
  `femea_id` int(11) DEFAULT NULL,
  `data_cobertura` date DEFAULT NULL,
  `data_parto_prevista` date DEFAULT NULL,
  `data_parto_real` date DEFAULT NULL,
  `resultado` enum('confirmadO','negativo','abortou') DEFAULT NULL,
  `observacoes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `saude_animais`
--

CREATE TABLE `saude_animais` (
  `id` int(11) NOT NULL,
  `animal_id` int(11) NOT NULL,
  `tipo_tratamento` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `data` date NOT NULL,
  `responsavel` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usertable`
--

CREATE TABLE `usertable` (
  `id_user` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `data_fundacao` date NOT NULL,
  `telefone` varchar(9) DEFAULT NULL,
  `nome_fazenda` varchar(100) DEFAULT NULL,
  `provincia` varchar(50) DEFAULT NULL,
  `municipio` varchar(50) DEFAULT NULL,
  `tipo_gado` varchar(20) DEFAULT NULL,
  `senha_hash` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usertable`
--

INSERT INTO `usertable` (`id_user`, `username`, `email`, `data_fundacao`, `telefone`, `nome_fazenda`, `provincia`, `municipio`, `tipo_gado`, `senha_hash`) VALUES
(1, 'Dionisio Pedro', 'pepsi@gmail.com', '2020-01-12', NULL, NULL, 'Luanda', 'Belas', 'corte', '$2y$10$eAkOCn9dy.eqOFd67dEprekKiFNS3x/STLV2ZA8GgzAuHEi5YXJ9W'),
(2, 'Carlos INÁCIO', 'carlos@gmail.com', '2020-03-12', NULL, NULL, 'Benguela', 'Baía Farta', 'corte', '$2y$10$dumzSnhozdn4d2SrP3UR7OkywOvWD4SAQlIblxAtnYPaROu2pvuOi');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `animais`
--
ALTER TABLE `animais`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identificacao` (`identificacao`);

--
-- Indexes for table `estoque_insumos`
--
ALTER TABLE `estoque_insumos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `insumo_id` (`insumo_id`);

--
-- Indexes for table `insumos`
--
ALTER TABLE `insumos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reproducao`
--
ALTER TABLE `reproducao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `macho_id` (`macho_id`),
  ADD KEY `femea_id` (`femea_id`);

--
-- Indexes for table `saude_animais`
--
ALTER TABLE `saude_animais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `animal_id` (`animal_id`);

--
-- Indexes for table `usertable`
--
ALTER TABLE `usertable`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `animais`
--
ALTER TABLE `animais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estoque_insumos`
--
ALTER TABLE `estoque_insumos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `insumos`
--
ALTER TABLE `insumos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reproducao`
--
ALTER TABLE `reproducao`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `saude_animais`
--
ALTER TABLE `saude_animais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usertable`
--
ALTER TABLE `usertable`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `estoque_insumos`
--
ALTER TABLE `estoque_insumos`
  ADD CONSTRAINT `estoque_insumos_ibfk_1` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reproducao`
--
ALTER TABLE `reproducao`
  ADD CONSTRAINT `reproducao_ibfk_1` FOREIGN KEY (`macho_id`) REFERENCES `animais` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reproducao_ibfk_2` FOREIGN KEY (`femea_id`) REFERENCES `animais` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `saude_animais`
--
ALTER TABLE `saude_animais`
  ADD CONSTRAINT `saude_animais_ibfk_1` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
