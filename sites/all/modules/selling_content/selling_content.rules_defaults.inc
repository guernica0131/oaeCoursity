<?php
/**
 * @file
 * selling_content.rules_defaults.inc
 */

/**
 * Implements hook_default_rules_configuration().
 */
function selling_content_default_rules_configuration() {
  $items = array();
  $items['rules_og_subscribe_after_product_purchased'] = entity_import('rules_config', '{ "rules_og_subscribe_after_product_purchased" : {
      "LABEL" : "OG subscribe after Product purchased",
      "PLUGIN" : "reaction rule",
      "WEIGHT" : "4",
      "REQUIRES" : [ "commerce_payment", "rules", "commerce_checkout" ],
      "ON" : [ "commerce_checkout_complete" ],
      "IF" : [
        { "commerce_payment_order_balance_comparison" : { "commerce_order" : [ "commerce_order" ], "value" : "0" } }
      ],
      "DO" : [
        { "LOOP" : {
            "USING" : { "list" : [ "commerce-order:commerce-line-items" ] },
            "ITEM" : { "list_item" : "Current list item" },
            "DO" : [
              { "component_rules_og_subscribe_line_item" : { "line_item" : [ "list-item" ] } }
            ]
          }
        }
      ]
    }
  }');
  $items['rules_og_subscribe_line_item'] = entity_import('rules_config', '{ "rules_og_subscribe_line_item" : {
      "LABEL" : "OG subscribe line item",
      "PLUGIN" : "rule",
      "REQUIRES" : [ "rules", "og" ],
      "USES VARIABLES" : { "line_item" : { "label" : "Line Item", "type" : "commerce_line_item" } },
      "IF" : [
        { "data_is" : { "data" : [ "line-item:type" ], "value" : "product" } },
        { "data_is" : { "data" : [ "line-item:commerce-product:type" ], "value" : "og_product" } },
        { "NOT data_is_empty" : { "data" : [ "line-item:commerce-product:field-og-reference" ] } }
      ],
      "DO" : [
        { "LOOP" : {
            "USING" : { "list" : [ "line-item:commerce-product:field-og-reference" ] },
            "ITEM" : { "og_reference" : "Current OG Reference" },
            "DO" : [
              { "og_subcribe_user" : { "user" : [ "line-item:order:owner" ], "group" : [ "og-reference" ] } }
            ]
          }
        }
      ]
    }
  }');
  $items['rules_og_unsubscribe_after_order_canceled'] = entity_import('rules_config', '{ "rules_og_unsubscribe_after_order_canceled" : {
      "LABEL" : "OG unsubscribe after Order Canceled",
      "PLUGIN" : "reaction rule",
      "REQUIRES" : [ "rules", "entity" ],
      "ON" : [ "commerce_order_update" ],
      "IF" : [
        { "data_is" : { "data" : [ "commerce-order:state" ], "value" : "canceled" } }
      ],
      "DO" : [
        { "LOOP" : {
            "USING" : { "list" : [ "commerce-order:commerce-line-items" ] },
            "ITEM" : { "list_item" : "Current list item" },
            "DO" : [
              { "component_rules_og_unsubscribe_line_item" : { "line_item" : [ "list-item" ] } }
            ]
          }
        }
      ]
    }
  }');
  $items['rules_og_unsubscribe_line_item'] = entity_import('rules_config', '{ "rules_og_unsubscribe_line_item" : {
      "LABEL" : "OG unsubscribe line item",
      "PLUGIN" : "rule",
      "REQUIRES" : [ "rules", "og" ],
      "USES VARIABLES" : { "line_item" : { "label" : "Line Item", "type" : "commerce_line_item" } },
      "IF" : [
        { "data_is" : { "data" : [ "line-item:type" ], "value" : "product" } },
        { "data_is" : { "data" : [ "line-item:commerce-product:type" ], "value" : "og_product" } },
        { "NOT data_is_empty" : { "data" : [ "line-item:commerce-product:field-og-reference" ] } }
      ],
      "DO" : [
        { "LOOP" : {
            "USING" : { "list" : [ "line-item:commerce-product:field-og-reference" ] },
            "ITEM" : { "og_reference" : "Current OG Reference" },
            "DO" : [
              { "og_unsubscribe_user" : { "user" : [ "line-item:order:owner" ], "group" : [ "og-reference" ] } }
            ]
          }
        }
      ]
    }
  }');
  return $items;
}
