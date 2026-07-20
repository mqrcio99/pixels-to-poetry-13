# Simulador de Arquitetura

Ferramenta educacional para visualizar, de forma interativa, como os componentes de um sistema de software se comunicam entre si — pensada para alunos que estão aprendendo conceitos de arquitetura, abstração de código e escalabilidade.

Com uma interface no estilo whiteboard (traços desenhados à mão, tipo Excalidraw), o aluno monta a topologia de um sistema arrastando componentes para um canvas infinito, conecta-os com setas e simula requisições reais percorrendo esse caminho — visualizando latência, carga e falhas em tempo real.

## Funcionalidades

- **Canvas infinito** com pan e zoom, no estilo quadro branco.
- **Biblioteca de componentes** organizada por categoria:
  - **Cliente**: Navegador, App Mobile
  - **Rede / Infra**: API Gateway, Load Balancer
  - **Backend**: Servidor Web, Microsserviço, Fila
  - **Dados**: Cache (Redis), Banco SQL
- **Drag and drop** dos componentes para o canvas.
- **Conexões entre componentes** ligando os pontos de cada bloco, representando chamadas/requisições entre eles.
- **Simulação de requisições** com botão "Simular", controle de velocidade (lenta/normal/rápida) e modo passo a passo para uso em sala de aula.
- **Controle de carga** (slider de requisições simultâneas) para observar o comportamento do sistema sob diferentes volumes de tráfego.
- **Simulação de erros** configurável (nenhum, timeout, 500 etc.).
- **Console de requisições** exibindo em tempo real o log de cada requisição simulada.
- **Painel de detalhes didático**, com explicação de cada componente e conexão ao clicar neles.
- **Ferramentas de anotação** no canvas (desenho livre, texto, caneta, comentário).
- **Exportação em JSON** da topologia montada, e opção de limpar o log de simulação.

## Em desenvolvimento

- **Modelagem de escalabilidade a partir da topologia**: o simulador deve reconhecer se um "Servidor Web" está sozinho recebendo carga (ambiente não-escalável, sujeito a fila e erros 503 sob alta carga) ou se está atrás de um "Load Balancer" com múltiplas réplicas conectadas (ambiente escalável, com carga distribuída entre os servidores).
- **Barra de carga visual** dentro de cada bloco de servidor/microsserviço, indicando o quanto da capacidade máxima está em uso (verde/amarelo/vermelho).
- **Camadas de abstração**: possibilidade de expandir um componente (ex: Servidor Web) para revelar sua estrutura interna (Controller → Service → Repository), permitindo alternar entre visão de alto nível e visão de baixo nível do mesmo sistema.

## Como usar

1. Arraste os componentes desejados da barra lateral esquerda para o canvas.
2. Conecte os componentes clicando e arrastando entre os pontos de conexão nas bordas dos blocos.
3. Ajuste a **Carga** simulada e a **Velocidade** da simulação conforme desejado.
4. Clique em **Simular** para ver a requisição percorrer o caminho montado, com o log aparecendo no Console de requisições.
5. Clique em qualquer componente ou seta para ver, no painel **Detalhes**, uma explicação didática sobre seu papel no sistema.
6. Use **Exportar JSON** para salvar a topologia montada.

## Objetivo pedagógico

O simulador foi projetado para que um aluno iniciante consiga, em poucos minutos, entender visualmente:

- Como as peças de um sistema real se comunicam (protocolos, requisições, respostas).
- A diferença prática entre um ambiente escalável e um não-escalável, ao montar e testar diferentes topologias com os mesmos componentes.
- O papel de cada peça de infraestrutura (load balancer, cache, fila, banco de dados) na resiliência e performance de um sistema.

## Stack técnica

- React + TypeScript + Tailwind CSS
- Canvas interativo para nós e conexões
- Animações da simulação de requisição
- Componentes de UI estilizados no padrão hand-drawn (fonte manuscrita, bordas irregulares)

## Status do projeto

Protótipo em desenvolvimento ativo via [Lovable](https://lovable.dev). Funcionalidades de escalabilidade e camadas de abstração ainda em construção/ajuste.
