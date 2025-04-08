let btn = document.querySelector('#btn');
let sidebar = document.querySelector('.sidebar');

btn.onclick = function(){
  sidebar.classList.toggle('open');
}

// Dados de equipamentos (apenas os cadastrados manualmente)
let equipments = [];

// Configurações de paginação
let currentPage = 1;
let itemsPerPage = 10;

// Mapeamento de tipos de equipamento para prefixos
const equipmentPrefixes = {
  'Paquímetro': 'PAQ',
  'Micrômetro Externo': 'MIC',
  'Micrômetro Interno': 'MIC',
  'Micrômetro de Profundidade': 'MIC-P',
  'Régua Milimetrada': 'REG',
  'Trena Metálica': 'TRE',
  'Calibrador de Folga': 'CAL-F',
  'Calibrador de Rosca': 'CAL-R',
  'Calibrador Tipo Anel': 'CAL-A',
  'Calibrador Tipo Tampão': 'CAL-T',
  'Pino Padrão': 'PIN',
  'Balança Analítica': 'BAL-A',
  'Balança de Precisão': 'BAL-P',
  'Balança Industrial': 'BAL-I',
  'Peso Padrão': 'PES',
  'Cronômetro': 'CRO',
  'Tacômetro': 'TAC',
  'Estroboscópio': 'EST',
  'Termômetro Digital': 'TER-D',
  'Termômetro Infravermelho': 'TER-I',
  'Termômetro de Mercúrio': 'TER-M',
  'Termopar': 'TER-P',
  'Pirômetro': 'PIR',
  'Sensor RTD': 'RTD',
  'Sensor PT100': 'PT100',
  'Manômetro': 'MAN',
  'Vacuômetro': 'VAC',
  'Transdutor de Pressão': 'TRA-P',
  'Medidor de Vazão': 'MED-V',
  'Medidor de Coluna de Líquido': 'MED-C',
  'Projetor de Perfil': 'PRO',
  'Microscópio de Medição': 'MIC-M',
  'Câmera de Inspeção': 'CAM',
  'Rugosímetro': 'RUG',
  'Durômetro': 'DUR',
  'Refratômetro': 'REF',
  'Torquímetro': 'TOR',
  'Medidor de Dureza Rockwell': 'DUR-R',
  'Medidor de Dureza Brinell': 'DUR-B',
  'Medidor de Dureza Vickers': 'DUR-V',
  'Medidor de Espessura Ultrassônico': 'MED-U',
  'Medidor de Espessura de Pintura': 'MED-P',
  'Medidor de pH': 'PH',
  'Data Logger de Temperatura': 'LOG-T',
  'Data Logger de Umidade': 'LOG-U',
  'Colorímetro': 'COL',
  'Espectrofotômetro': 'ESP'
};

// Função para carregar dados do localStorage
function loadEquipments() {
  const storedEquipments = localStorage.getItem('equipments');
  if (storedEquipments) {
    equipments = JSON.parse(storedEquipments);
  }
}

// Função para salvar dados no localStorage
function saveEquipments() {
  localStorage.setItem('equipments', JSON.stringify(equipments));
}

// Função para verificar o status de calibração
function getCalibrationStatus(nextCalibration) {
  const today = new Date();
  const nextDate = new Date(nextCalibration);
  const diffTime = nextDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= 90) { // Alterado para 3 meses (90 dias)
    return 'warning';
  } else {
    return 'ok';
  }
}

// Função para renderizar a tabela de equipamentos
function renderEquipmentTable() {
  const tableBody = document.getElementById('equipmentTableBody');
  if (!tableBody) return;

  const statusFilter = document.getElementById('filterStatus')?.value;
  const sectorFilter = document.getElementById('filterSector')?.value;
  const typeFilter = document.getElementById('filterType')?.value;
  const searchTerm = document.getElementById('searchEquipment')?.value.toLowerCase();
  
  // Filtrar equipamentos
  let filteredEquipments = equipments;
  
  if (statusFilter) {
    filteredEquipments = filteredEquipments.filter(eq => eq.status === statusFilter);
  }
  
  if (sectorFilter) {
    filteredEquipments = filteredEquipments.filter(eq => eq.sector === sectorFilter);
  }
  
  if (typeFilter) {
    filteredEquipments = filteredEquipments.filter(eq => eq.type === typeFilter);
  }
  
  if (searchTerm) {
    filteredEquipments = filteredEquipments.filter(eq =>
      eq.nomenclature.toLowerCase().includes(searchTerm) ||
      eq.type.toLowerCase().includes(searchTerm) ||
      eq.sector.toLowerCase().includes(searchTerm) ||
      (eq.description && eq.description.toLowerCase().includes(searchTerm))
    );
  }
  
  // Ordenar equipamentos por nomenclatura
  filteredEquipments.sort((a, b) => a.nomenclature.localeCompare(b.nomenclature));

  // Adicionar evento de pesquisa em tempo real
  if (document.getElementById('searchEquipment')) {
    document.getElementById('searchEquipment').addEventListener('input', () => {
      currentPage = 1;
      renderEquipmentTable();
    });
  }

  // Adicionar eventos de filtro
  if (document.getElementById('filterStatus')) {
    document.getElementById('filterStatus').addEventListener('change', () => {
      currentPage = 1;
      renderEquipmentTable();
    });
  }

  if (document.getElementById('filterSector')) {
    document.getElementById('filterSector').addEventListener('change', () => {
      currentPage = 1;
      renderEquipmentTable();
    });
  }

  if (document.getElementById('filterType')) {
    document.getElementById('filterType').addEventListener('change', () => {
      currentPage = 1;
      renderEquipmentTable();
    });
  }

  // Calcular paginação
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEquipments = filteredEquipments.slice(startIndex, endIndex);

  // Limpar tabela
  tableBody.innerHTML = '';

  // Renderizar equipamentos
  paginatedEquipments.forEach(equipment => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${equipment.nomenclature}</td>
      <td>${equipment.type}</td>
      <td>${equipment.sector}</td>
      <td><span class="status-${equipment.status}">${getStatusText(equipment.status)}</span></td>
      <td>${formatDate(equipment.lastCalibration)}</td>
      <td>
        <span class="calibration-status calibration-${getCalibrationStatus(equipment.nextCalibration)}">
          ${formatDate(equipment.nextCalibration)}
        </span>
      </td>
      <td class="action-buttons">
        <button class="btn-edit" onclick="editEquipment('${equipment.nomenclature}')"><i class='bx bx-edit-alt'></i></button>
        <button class="btn-delete" onclick="deleteEquipment('${equipment.nomenclature}')"><i class='bx bx-trash'></i></button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Atualizar informações de paginação
  updatePagination(filteredEquipments.length);
}

// Função para atualizar controles de paginação
function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageInfo = document.getElementById('pageInfo');
  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');

  if (pageInfo && prevButton && nextButton) {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
  }
}

// Função para formatar data
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

// Função para obter texto do status
function getStatusText(status) {
  const statusMap = {
    'available': 'Disponível',
    'maintenance': 'Em Manutenção',
    'calibration': 'Em Calibração',
    'discarded': 'Descartado'
  };
  return statusMap[status] || status;
}

// Event Listeners para paginação
if (document.getElementById('prevPage')) {
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderEquipmentTable();
    }
  });
}

if (document.getElementById('nextPage')) {
  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    renderEquipmentTable();
  });
}

if (document.getElementById('itemsPerPage')) {
  document.getElementById('itemsPerPage').addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    renderEquipmentTable();
  });
}

if (document.getElementById('statusFilter')) {
  document.getElementById('statusFilter').addEventListener('change', () => {
    currentPage = 1;
    renderEquipmentTable();
  });
}

// Manipulação do formulário de equipamento
const equipmentForm = document.getElementById('equipmentForm');
if (equipmentForm) {
  equipmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(equipmentForm);
    const equipment = {
      nomenclature: formData.get('nomenclature'),
      sector: formData.get('sector'),
      type: formData.get('type'),
      standardLocation: formData.get('standardLocation'),
      currentLocation: formData.get('currentLocation'),
      status: formData.get('status'),
      lastCalibration: formData.get('lastCalibration'),
      nextCalibration: formData.get('nextCalibration')
    };

    // Validar nomenclatura
    const equipmentType = equipment.type;
    const prefix = equipmentPrefixes[equipmentType];
    const nomenclatureRegex = new RegExp(`^${prefix}-\\d{3}$`);
    
    if (!nomenclatureRegex.test(equipment.nomenclature)) {
      alert(`A nomenclatura deve seguir o padrão ${prefix}-XXX, onde XXX são números (ex: ${prefix}-001)`);
      return;
    }

    // Verificar se a nomenclatura já existe
    const existingIndex = equipments.findIndex(eq => eq.nomenclature === equipment.nomenclature);
    if (existingIndex >= 0) {
      equipments[existingIndex] = equipment;
    } else {
      equipments.push(equipment);
    }

    saveEquipments();
    window.location.href = 'index.html';
  });
}

// Carregar dados ao iniciar
loadEquipments();

// Renderizar tabela se estiver na página de equipamentos
if (document.getElementById('equipmentTableBody')) {
  renderEquipmentTable();
}

// Função para editar equipamento
function editEquipment(nomenclature) {
  const equipment = equipments.find(eq => eq.nomenclature === nomenclature);
  if (equipment) {
    // Armazenar dados do equipamento para edição
    localStorage.setItem('editingEquipment', JSON.stringify(equipment));
    window.location.href = 'cadastro-equipamento.html';
  }
}

// Função para exibir toast notifications
function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }, 100);
}

// Função para excluir equipamento
function deleteEquipment(nomenclature) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <i class='bx bx-error-circle'></i>
        <h3 class="modal-title">Confirmar Exclusão</h3>
      </div>
      <div class="modal-body">
        Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita.
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-cancel">Cancelar</button>
        <button class="modal-btn modal-btn-confirm">Excluir</button>
      </div>
    </div>
  `;

document.body.appendChild(modalOverlay);
modalOverlay.classList.add('active');

  const confirmBtn = modalOverlay.querySelector('.modal-btn-confirm');
  const cancelBtn = modalOverlay.querySelector('.modal-btn-cancel');

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    modalOverlay.remove();
  };

  const handleConfirm = () => {
    const index = equipments.findIndex(eq => eq.nomenclature === nomenclature);
    if (index !== -1) {
      equipments.splice(index, 1);
      saveEquipments();
      // Resetar paginação para garantir que a tabela seja renderizada corretamente
      currentPage = 1;
      renderEquipmentTable();
      showToast('Equipamento removido com sucesso!', 'success');
    } else {
      showToast('Equipamento não encontrado!', 'error');
    }
    closeModal();
  };

  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', closeModal);
  
  // Fechar modal ao clicar fora
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
}

// Carregar dados do equipamento no formulário se estiver editando
if (equipmentForm) {
  const editingEquipment = localStorage.getItem('editingEquipment');
  if (editingEquipment) {
    const equipment = JSON.parse(editingEquipment);
    document.getElementById('nomenclature').value = equipment.nomenclature;
    document.getElementById('type').value = equipment.type;
    document.getElementById('sector').value = equipment.sector;
    document.getElementById('standardLocation').value = equipment.standardLocation;
    document.getElementById('currentLocation').value = equipment.currentLocation;
    document.getElementById('status').value = equipment.status;
    document.getElementById('lastCalibration').value = equipment.lastCalibration;
    document.getElementById('nextCalibration').value = equipment.nextCalibration;
    
    // Limpar dados de edição após carregar
    localStorage.removeItem('editingEquipment');
  }
}