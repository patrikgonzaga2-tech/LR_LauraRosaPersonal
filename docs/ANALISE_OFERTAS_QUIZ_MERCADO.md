# Análise das ofertas, do quiz e do mercado (09/10/2026)

Base: vendas aprovadas dos últimos 90 dias e eventos do quiz dos últimos 14 dias (Supabase `fjlbvoephhextnxemygf`, só leitura). Mercado: pesquisa web, fontes fracas (blogs de fornecedores). Tratar como ordem de grandeza.

## 1. As ofertas fazem sentido?

**Não do jeito que estão.** Problemas:

1. **Muitas ofertas para o mesmo produto.** A anual tem 6 códigos (M3DUOL, ij3kFo, mhl4tN, omiNl7, 6JtnDu, 7x5nNN) e a trimestral tem 4. O teste fica ilegível.
2. **Quem compra é a anual, não a mensal.** Em 90 dias: anuais (Greenn) ≈ 320 vendas; mensal R$ 97 = 23; trimestral R$ 97 = 23. A oferta que vende é a que ninguém está testando.
3. **A escada de preços está torta.** A mensal a R$ 97 faz a anual de R$ 297 (= R$ 24,75 por mês) parecer 4 vezes mais barata. Uma mensal a R$ 27 colocaria a anual a R$ 24,75 por mês, a apenas R$ 2,25 de diferença. Com a mensal a R$ 27, quase ninguém escolheria a anual, e o teste C pode derrubar a receita.
4. **O preço "real" do Efeito Lipo é R$ 29,60.** O popup de saída dá 20% (EFEITOLIPO20). Quase todas as vendas do QN7gci saem por esse cupom. Um teste de R$ 47 sem o cupom compararia com R$ 37 com cupom. Precisa ser igual nos braços.
5. **O campo `price` mistura valor à vista e parcela** (ex.: R$ 39,92 e R$ 24,75 para anuais). Antes de decidir por número de venda, conferir a coluna.

## 2. O quiz

Eventos dos últimos 14 dias: 181 sessões com pageview → 52 clicaram em "começar" (**29%**) → 28 concluíram (54% de quem começou) → 20 clicaram em comprar (**71% de quem concluiu**).

- **Gargalo principal: pageview → começar (29%).** É o mesmo problema do diagnóstico de 07/10 (a régua antiga era 32% passando da T1). Não é a oferta.
- **Depois da T1, o quiz converte bem.** 71% de quem termina clica em comprar. A oferta (T26) funciona como página.
- Conclusão: testar a **T1** (teste G) tem mais retorno do que testar preço. Preço só importa para quem chega na T26.

## 3. O mercado (com ressalva de fonte)

- Ebooks de emagrecimento no Brasil aparecem entre R$ 22 e R$ 38. O EL a R$ 37 está no topo dessa faixa; a promessa precisa justificar o preço.
- Taxa de conversão de página de vendas de infoproduto: 1% a 3% (referência de blog, sem fonte primária). Nosso quiz tem 20 cliques em comprar em 181 sessões (11%), bem acima disso, porque o público já passou pelo quiz.
- CPM de infoproduto abaixo de R$ 297: R$ 20 a R$ 45 (relatório 2026, trecho truncado; conferir antes de usar).
- Assinatura de comunidade: não achei dado de churn para comunidades de emagrecimento no Brasil. A mensal dura em média 1,3 mês (nossa base, doc de 09/10); a anual, quase 11 meses. **Por isso a anual vende mais e dá mais caixa.**
- Upsell: os melhores números vêm de compra com cartão já salvo (1 clique). Cuidado com fadiga e com ticket alto que derruba conversão.

## 4. Ideias (em ordem de impacto na meta de R$ 10 mil em outubro)

1. **Teste G (T1)**: o maior vazamento está antes do "começar". Ideia: texto da primeira tela falando do efeito de 7 dias, para casar com o anúncio.
2. **Trocar a âncora de assinatura**: em vez de mensal R$ 37, testar **anual 12x como upsell do EL** (a que mais vende). Isso já existe, só falta pôr na frente.
3. **Enxugar a Comunidade**: deixar 1 mensal, 1 anual e 1 trimestral ativas. Os outros códigos pausados. Só com seu ok e fora dos testes.
4. **Preço do EL no teste B**: manter o popup de 20% nos 3 braços. Assim a comparação é justa (R$ 29,60 × R$ 37,60 efetivos).
5. **Antes de criar qualquer oferta nova**, conferir a coluna `price` (à vista × parcela) para não tomar decisão com número errado.

## 5. Recomendação de ordem dos testes

1. **G (T1)** primeiro: maior ganho, não mexe em pagamento.
2. **B (preço do EL)**: com popup igual nos braços.
3. **E (com ou sem EL)** e **D (anual × mensal)**: depois de ver o B.
4. Corte de códigos (item 3 acima): com seu ok, a qualquer momento.

Nada disso muda preço, checkout ou link sem sua aprovação (CLAUDE.md).
