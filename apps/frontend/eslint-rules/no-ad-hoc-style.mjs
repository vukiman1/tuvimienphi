const ARBITRARY_COLOUR_OR_PX = /\[[^\]]*(#[0-9a-fA-F]{3,8}|\d+(\.\d+)?px)[^\]]*\]/;
const BARE_HEX_COLOUR = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function reportAdHoc(context, node, text) {
  if (ARBITRARY_COLOUR_OR_PX.test(text)) {
    context.report({ node, messageId: 'adHocClass' });
    return;
  }
  if (BARE_HEX_COLOUR.test(text.trim())) {
    context.report({ node, messageId: 'adHocColour' });
  }
}

const noAdHocStyle = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow hex colours and arbitrary px sizes outside the design tokens' },
    schema: [],
    messages: {
      adHocClass: 'Use a design token instead of an arbitrary hex colour or px value in a class.',
      adHocColour: 'Use a design token instead of a hex colour.',
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          reportAdHoc(context, node, node.value);
        }
      },
      TemplateElement(node) {
        reportAdHoc(context, node, node.value.raw);
      },
    };
  },
};

export default noAdHocStyle;
