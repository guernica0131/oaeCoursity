<?php
/**
 * @file
 * oa_groups.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function oa_groups_ctools_plugin_api() {
  list($module, $api) = func_get_args();
  if ($module == "panelizer" && $api == "panelizer") {
    return array("version" => "1");
  }
  list($module, $api) = func_get_args();
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_views_api().
 */
function oa_groups_views_api() {
  return array("api" => "3.0");
}

/**
 * Implements hook_node_info().
 */
function oa_groups_node_info() {
  $items = array(
    'oa_group' => array(
      'name' => t('Group'),
      'base' => 'node_content',
      'description' => t('A collection of content and users (members)'),
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => '',
    ),
    'oa_organization' => array(
      'name' => t('Organization'),
      'base' => 'node_content',
      'description' => t('A collection of users that exists across all groups.'),
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => '',
    ),
  );
  return $items;
}