terraform {
  required_providers {
    ovirt = {
      source = "oVirt/ovirt"
    }
  }
}

provider "ovirt" {
  # Set this to your oVirt Engine URL, e.g. https://example.com/ovirt-engine/api/
  url = var.url
  # Set this to your oVirt username, e.g. admin@internal
  username = var.username
  # Set this to your oVirt password.
  password = var.password
  # Take trusted certificates from the specified files (list).
  tls_ca_files = ["/app/pki-resource.cer"]
  # Set this to true to use the system certificate storage to verify the engine certificate. You must
  # Set to true if you want to run an in-memory test. In this mode all other options will be ignored.
  mock = false
}

#Создание пустой ВМ из шаблона Blank


resource "ovirt_vm" "vm" {
  name        = var.name
  cluster_id  = var.cluster_id
  template_id = var.template_id
  memory      = var.memory_gb * 1024 * 1024 * 1024
  cpu_cores   = var.cpu_cores
  cpu_sockets = 1
  cpu_threads = 1
  clone       = true
}

# Создание нового диска
resource "ovirt_disk" "disk" {
  count = var.template_id == "00000000-0000-0000-0000-000000000000" ? 1 : 0
  alias             = "${var.name}-disk"
  size              = var.disk_size_gb * 1024 * 1024 * 1024
  format            = var.format_disk
  storage_domain_id = var.storage_domain_id
  sparse            = var.sparce_var
}

# Присоединение диска к ВМ
resource "ovirt_disk_attachment" "disk_attachment" {
  count = var.template_id == "00000000-0000-0000-0000-000000000000" ? 1 : 0
  vm_id       = ovirt_vm.vm.id
  disk_id     = ovirt_disk.disk[count.index].id
  disk_interface   = var.disk_interface_var
  bootable    = var.bootable_var
  active      = var.active_disk_var
}