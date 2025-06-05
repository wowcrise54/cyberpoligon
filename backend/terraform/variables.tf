variable "name" {
  description = "Название виртуальной машины"
  type        = string
}

variable "cpu_cores" {
  description = "Количество ядер процессора"
  type        = number
}

variable "memory_gb" {
  description = "Оперативная память (в ГБ)"
  type        = number
}

variable "disk_size_gb" {
  description = "Размер диска (в ГБ)"
  type        = number
  default = 0
}

variable "os_type" {
  description = "Операционная система"
  type        = string
  default = "None"
}

variable "url" {
  description = "Ссылка на сервер"
  type = string
  default = "https://cluster.acid-tech.ru/ovirt-engine/api"
}

variable "cert_tls" {
  description = "Путь к сертификату"
  type = string
  default = "D:\\VKR\\cert\\pki-resource.cer"
}
variable "password" {
  description = "Пароль"
  type = string
  default = "P@ssw0rd"
}

variable "username" {
  description = "Имя пользователя"
  type = string
  default = "admin@zvirt@internal"
}

variable "format_disk" {
  description = "Формат Диска"
  type = string
  default = "raw"  
}

variable "sparce_var" {
  description = "Разъем диска"
  type = bool
  default = true
}

variable "storage_domain_id" {
  description = "Id хранилища дисков"
  type = string
  default = "b71e2f38-55f9-44bc-9818-118c75416468"
}

variable "disk_interface_var" {
  description = "Интерфейс диска"
  type = string
  default = "virtio_scsi"
}

variable "bootable_var" {
  description = "Запускаемый диск"
  type = bool
  default = true
}

variable "active_disk_var" {
  description = "Активный ли диск"
  type = bool
  default = true
}

variable "template_id" {
  description = "ID клонируемого шаблона"
  type = string
}

variable "cluster_id" {
  description = "ID кластера"
  type = string
  default = "05877b36-309f-11f0-a91f-00163e3249e4"
}