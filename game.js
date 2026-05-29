// game.js
class ECSWorld {
    constructor() {
        this.nextEntityId = 0;
        this.components = new Map(); // Guarda: 'nome_componente' -> Map(entityId -> dados)
        this.systems = [];
        this.resources = new Map();
    }

    setResource(name, value) {
        this.resources.set(name, value);
    }

    getResource(name) {
        return this.resources.get(name);
    }

    // Registra dinamicamente um novo tipo de componente quando o arquivo é carregado
    registerComponent(componentName) {
        if (!this.components.has(componentName)) {
            this.components.set(componentName, new Map());
        }
    }

    createEntity() {
        return this.nextEntityId++;
    }

    // Adiciona componentes de forma segura
    addComponent(entityId, componentName, data = {}) {
        const componentStore = this.components.get(componentName);
        if (componentStore) {
            componentStore.set(entityId, data);
        } else {
            console.warn(`Tentativa de adicionar componente não registrado: ${componentName}`);
        }
    }

    // Retorna os dados do componente se existir, ou null se o commit foi removido
    getComponent(entityId, componentName) {
        const store = this.components.get(componentName);
        return store ? store.get(entityId) : null;
    }

    // Retorna apenas as entidades que possuem TODOS os componentes pedidos
    query(...componentNames) {
        // Se algum dos componentes da busca sequer foi registrado no jogo, retorna vazio
        if (componentNames.some(name => !this.components.has(name))) {
            return [];
        }

        // Pega o primeiro componente da lista para usar como base de iteração
        const firstStore = this.components.get(componentNames[0]);
        const validEntities = [];

        for (const entityId of firstStore.keys()) {
            const hasAll = componentNames.every(name => this.components.get(name).has(entityId));
            if (hasAll) validEntities.push(entityId);
        }
        return validEntities;
    }

    removeComponent(entityId, componentName) {
    const store = this.components.get(componentName);
    if (store) {
        store.delete(entityId);
        }
    }

    // Útil para limpar entidades mortas inteiramente
    destroyEntity(entityId) {
        for (const store of this.components.values()) {
            store.delete(entityId);
        }
    }

    registerSystem(name, systemFunction) {
        this.systems.push({ name, fn: systemFunction });
    }

    update(deltaTime) {
        for (const system of this.systems) {
            system.fn(deltaTime);
        }
    }
}

export const world = new ECSWorld();