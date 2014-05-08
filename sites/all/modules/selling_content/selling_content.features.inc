<?php
/**
 * @file
 * selling_content.features.inc
 */

/**
 * Implements hook_commerce_product_default_types().
 */
function selling_content_commerce_product_default_types() {
  $items = array(
    'og_product' => array(
      'type' => 'og_product',
      'name' => 'Product for Organic Group',
      'description' => '',
      'help' => '',
      'revision' => '1',
    ),
  );
  return $items;
}

/**
 * Implements hook_ctools_plugin_api().
 */
function selling_content_ctools_plugin_api() {
  list($module, $api) = func_get_args();
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_node_info().
 */
function selling_content_node_info() {
  $items = array(
    'content_group' => array(
      'name' => t('Content Group'),
      'base' => 'node_content',
      'description' => t('A group groups content like articles, videos etc.'),
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => '',
    ),
    'group_content' => array(
      'name' => t('Group Content'),
      'base' => 'node_content',
      'description' => t('The content page for an article, video etc.'),
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => '',
    ),
    'og_product' => array(
      'name' => t('Product for Organic Group'),
      'base' => 'node_content',
      'description' => '',
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => '',
    ),
  );
  return $items;
}
